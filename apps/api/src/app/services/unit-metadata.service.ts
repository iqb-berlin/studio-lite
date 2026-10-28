import { Logger } from '@nestjs/common';
import {
  ProfileValues,
  UnitFullMetadataDto,
  UnitItemWithMetadataDto,
  UnitMetadataDto,
  UnitMetadataValues
} from '@studio-lite-lib/api-dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import {
  HIDDEN_PROFILE_ORDER, orderFromCurrent, profileIdsMatch, reconcileProfilesByProfileId, toW3idProfileId
} from '@studio-lite/shared-code';
import UnitMetadata from '../entities/unit-metadata.entity';
import Unit from '../entities/unit.entity';
import Workspace from '../entities/workspace.entity';
import { UnitItemService } from './unit-item.service';
import { MetadataProfileService } from './metadata-profile.service';
import { UnitMetadataToDeleteService } from './unit-metadata-to-delete.service';
import { UnitNotFoundException } from '../exceptions/unit-not-found.exception';
import { ItemUuidLookup } from '../interfaces/item-uuid-lookup.interface';
import { ensureValueAsText } from '../utils/metadata-value-as-text';

// Dedupes profile lookups within a single request (a units list shares the same
// profiles across units). Caches the pending promise so parallel unit reads
// under Promise.all reuse one DB fetch instead of each firing its own.
export type ProfileFetchCache = Map<string, ReturnType<MetadataProfileService['getStoredMetadataProfileFromDb']>>;

/**
 * The metadata of units: the rows of {@link UnitMetadata}, one per unit and profile, and above them
 * reading, saving and copying a unit's whole metadata -- its profiles and its items.
 *
 * Metadata has two homes and this service knows which one holds the truth for a given unit: the
 * older jsonb column on {@link Unit}, or the normalized tables, once the unit carries the marker
 * {@link UnitMetadataToDelete}. Reads ask the marker first; the write path fills the tables and
 * sets the marker in the same transaction.
 *
 * The row CRUD takes an optional EntityManager, because the whole metadata of a unit is written in
 * one transaction. What the write has to supply itself is written at {@link addMetadata}.
 */
export class UnitMetadataService {
  private readonly logger = new Logger(UnitMetadataService.name);

  constructor(
    @InjectRepository(UnitMetadata)
    private unitMetadataRepository: Repository<UnitMetadata>,
    @InjectRepository(Unit)
    private unitsRepository: Repository<Unit>,
    @InjectRepository(Workspace)
    private workspaceRepository: Repository<Workspace>,
    private unitItemService: UnitItemService,
    private unitMetadataToDeleteService: UnitMetadataToDeleteService,
    private metadataProfileService: MetadataProfileService
  ) {}

  // When a transactional manager is passed the write joins that transaction;
  // otherwise the injected repository (default connection) is used.
  private repo(manager?: EntityManager): Repository<UnitMetadata> {
    return manager ? manager.getRepository(UnitMetadata) : this.unitMetadataRepository;
  }

  async getAllByUnitId(unitId: number, manager?: EntityManager): Promise<UnitMetadataDto[]> {
    return this.repo(manager).findBy({ unitId: unitId });
  }

  /** The unit-level profiles of all the given units, in one query. */
  async getAllByUnitIds(unitIds: number[]): Promise<UnitMetadataDto[]> {
    if (!unitIds.length) return [];
    return this.unitMetadataRepository.findBy({ unitId: In(unitIds) });
  }

  async addMetadata(unitId: number, metadata: UnitMetadataDto, manager?: EntityManager): Promise<number> {
    metadata.unitId = unitId;
    const { id, ...metadataWithoutId } = metadata;
    // created_at and changed_at are NOT NULL columns without a DB default and the
    // client cannot supply them (the profile form re-emits without them), so they
    // are set here — otherwise the INSERT violates NOT NULL. `order` defaults to
    // -1 (hidden) when the client omits it.
    const now = new Date();
    const newItemMetadata = this.repo(manager).create({
      ...metadataWithoutId,
      order: metadataWithoutId.order ?? HIDDEN_PROFILE_ORDER,
      createdAt: metadataWithoutId.createdAt ?? now,
      changedAt: now
    });
    await this.repo(manager).save(newItemMetadata);
    return newItemMetadata.id;
  }

  /**
   * Overwrites the row with this id. It stays with its unit: a `unitId` in the payload -- the
   * metadata save passes on what the client sent -- used to hang it on any unit (#1816).
   */
  async updateMetadata(id: number, metadata: UnitMetadataDto, manager?: EntityManager): Promise<number> {
    const { unitId, ...values } = metadata;
    await this.repo(manager).update(id, { ...values, changedAt: new Date() });
    return id;
  }

  async removeMetadata(id: number, manager?: EntityManager): Promise<void> {
    await this.repo(manager).delete(id);
  }

  async getModifiedMetadataForUnit(
    unit: Unit,
    workspace: Workspace,
    profileCache?: ProfileFetchCache
  ): Promise<Unit> {
    const unitMetadataToDelete = await this.unitMetadataToDeleteService.getOneByUnit(unit.id);
    if (unitMetadataToDelete) {
      // findOnesMetadata already backfills valueAsText.
      unit.metadata = await this.findOnesMetadata(unit.id);
    } else {
      unit.metadata = await this.resolveValueAsText(
        UnitMetadataService.setCurrentProfiles(
          workspace.settings?.unitMDProfile,
          workspace.settings?.itemMDProfile,
          unit.metadata
        ),
        profileCache
      );
    }
    return unit;
  }

  static setCurrentProfiles(
    unitProfile: string, itemProfile: string, metadata: UnitMetadataValues
  ): UnitMetadataValues {
    if (!metadata) return metadata;
    return {
      ...metadata,
      ...(metadata.profiles && {
        profiles: metadata.profiles.map(profile => UnitMetadataService.setCurrentProfile(unitProfile, profile))
      }),
      ...(metadata.items && {
        items: metadata.items.map(item => ({
          ...item,
          ...(item.profiles && {
            profiles: item.profiles.map(profile => UnitMetadataService.setCurrentProfile(itemProfile, profile))
          })
        }))
      })
    };
  }

  // Also canonicalizes the profile id to its w3id form (#1570). setCurrentProfiles
  // sits on every path that reads or writes a metadata block — the units read
  // (including the legacy unit.metadata blob, which the 19.0.0 migration deliberately
  // leaves alone: rewriting its two nested profile arrays in jsonb would be the
  // riskiest statement of the changelog, for data that is canonical on every read
  // anyway and moves into the normalized tables on the next save), the metadata
  // save, the unit copy and the import — so a single rewrite
  // here is what makes the form, hideNumbering and the export agree on one
  // spelling even for units whose metadata was never re-saved.
  private static setCurrentProfile<T extends ProfileValues>(profileId: string, profile: T): T {
    return {
      ...profile,
      profileId: toW3idProfileId(profile.profileId),
      order: orderFromCurrent(profileIdsMatch(profile.profileId, profileId))
    };
  }

  // Applies valueAsText (incl. hideNumbering) for display. The hideNumbering
  // flags come from the stored profile definitions, so vocabulary numbering is
  // suppressed consistently in every read-only view that consumes valueAsText.
  private async resolveValueAsText(
    metadata: UnitMetadataValues,
    profileCache?: ProfileFetchCache
  ): Promise<UnitMetadataValues> {
    const hideNumbering = await this.buildHideNumberingMap(metadata, profileCache);
    return ensureValueAsText(metadata, hideNumbering);
  }

  /**
   * Builds profileId -> entryId -> hideNumbering from the DB-stored profile definitions of every
   * profile referenced by the metadata (unit and item profiles). DB-only reads keep this cheap on
   * list endpoints. Public so the XML export can fold the numbering back the same way (see
   * toLegacyMetadataBlob).
   */
  async buildHideNumberingMap(
    metadata: UnitMetadataValues | undefined,
    profileCache: ProfileFetchCache = new Map()
  ): Promise<Record<string, Record<string, boolean>>> {
    if (!metadata) return {};
    const profileIds = new Set<string>();
    (metadata.profiles ?? []).forEach(profile => {
      if (profile.profileId) profileIds.add(profile.profileId);
    });
    (metadata.items ?? []).forEach(item => (item.profiles ?? []).forEach(profile => {
      if (profile.profileId) profileIds.add(profile.profileId);
    }));
    const map: Record<string, Record<string, boolean>> = {};
    await Promise.all([...profileIds].map(async profileId => {
      let pending = profileCache.get(profileId);
      if (!pending) {
        pending = this.metadataProfileService.getStoredMetadataProfileFromDb(profileId);
        profileCache.set(profileId, pending);
      }
      const profile = await pending;
      if (!profile?.groups) return;
      const entryMap: Record<string, boolean> = {};
      profile.groups.forEach(group => (group.entries ?? []).forEach(entry => {
        const parameters = entry.parameters as { hideNumbering?: boolean } | null;
        if (parameters?.hideNumbering) entryMap[entry.id] = true;
      }));
      map[profileId] = entryMap;
    }));
    return map;
  }

  // Reconcile unit metadata by profileId (the profile form re-emits without the
  // row id), so an edit updates the existing row instead of delete + re-insert.
  async patchUnitMetadata(unitId: number, profiles: UnitMetadataDto[], manager?: EntityManager): Promise<void> {
    const existingProfiles = await this.getAllByUnitId(unitId, manager);
    await reconcileProfilesByProfileId(existingProfiles, profiles, {
      remove: id => this.removeMetadata(id, manager),
      update: (id, metadata) => this.updateMetadata(id, metadata, manager),
      add: metadata => this.addMetadata(unitId, metadata, manager)
    });
  }

  /**
   * Brings the unit's items in line with a save. An item the save names by a uuid the unit does not
   * have -- another unit's, or one deleted since -- is left alone and logged: it used to be updated
   * wherever it was (#1816). Skipping rather than refusing keeps a save that raced a deletion.
   */
  async patchItemsMetadata(
    unitId: number,
    items: UnitItemWithMetadataDto[],
    manager?: EntityManager,
    userName?: string | null
  ): Promise<void> {
    const itemsToUpdate = await this.unitItemService.getAllByUnitIdWithMetadata(unitId, manager);
    const {
      unchanged, removed, added, unknown
    } = UnitItemService.compare(itemsToUpdate, items, 'uuid');
    if (unknown.length) {
      this.logger.warn(`Metadata save of unit ${unitId} by ${userName || 'unknown user'} names items ` +
        `the unit does not have, left alone: ${unknown.map(item => item.uuid).join(', ')}`);
    }
    await Promise.all([
      ...unchanged.map(item => this.unitItemService.updateItem(item.uuid, item, manager)),
      ...removed.map(item => this.unitItemService.removeItem(item.uuid, manager)),
      ...added.map(item => this.unitItemService.addItem(unitId, item, manager))
    ]);
  }

  // Takes the internal write shape: id and unitItemUuid do not exist yet —
  // addItem/addItemMetadata generate or discard them — hence the casts at the
  // DTO boundary below.
  async copyItemsWithMetadata(
    unitId: number,
    metadata: UnitMetadataValues
  ): Promise<ItemUuidLookup[]> {
    const profiles = metadata.profiles || [];
    await Promise.all(profiles
      .map(profile => this.addMetadata(unitId, profile as UnitMetadataDto)));
    const items = metadata.items || [];
    const itemUuids = await Promise.all(items
      .map(async item => ({
        newUuid: await this.unitItemService
          .addItem(unitId, item as unknown as UnitItemWithMetadataDto),
        oldUuid: item.uuid
      })));
    await this.unitMetadataToDeleteService.upsertOneForUnit(unitId);
    return itemUuids;
  }

  /**
   * The whole metadata save runs in one transaction so a mid-sequence failure (e.g. a constraint
   * error on one profile) rolls back every write instead of leaving the unit's profiles/items
   * half-updated.
   *
   * The profile form re-emits profiles without `order`, so the current profile must be flagged here
   * from the workspace settings — otherwise a newly stored profile keeps the -1 (hidden) insert
   * default and, because the read path uses the normalized tables (permanent
   * unit_metadata_to_delete marker) without re-deriving, it would be read back as hidden.
   */
  async patchMetadata(unitId: number, metadata: UnitMetadataValues, userName?: string | null): Promise<void> {
    const unit = await this.unitsRepository.findOne({ where: { id: unitId } });
    if (!unit) throw new UnitNotFoundException(unitId, 0, 'PATCH');
    const workspace = await this.workspaceRepository.findOne({ where: { id: unit.workspaceId } });
    const withOrder = UnitMetadataService.setCurrentProfiles(
      workspace?.settings?.unitMDProfile,
      workspace?.settings?.itemMDProfile,
      metadata
    );
    const profiles = withOrder.profiles || [];
    const items = withOrder.items || [];
    await this.unitsRepository.manager.transaction(async manager => {
      await this.patchUnitMetadata(unitId, profiles as UnitMetadataDto[], manager);
      await this.patchItemsMetadata(unitId, items as unknown as UnitItemWithMetadataDto[], manager, userName);
      await this.unitMetadataToDeleteService.upsertOneForUnit(unitId, manager);
    });
  }

  async patchMetadataCurrentProfile(unitId: number, unitProfile: string = '', itemProfile: string = ''): Promise<void> {
    await this.patchUnitMetadataCurrentProfile(unitId, unitProfile);
    await this.unitItemService.patchItemMetadataCurrentProfile(unitId, itemProfile);
  }

  private async patchUnitMetadataCurrentProfile(unitId: number, unitProfile: string): Promise<void> {
    const profilesToUpdate: UnitMetadataDto[] = await this.getAllByUnitId(unitId);
    await Promise.all(profilesToUpdate.map(metadata => {
      metadata.order = orderFromCurrent(profileIdsMatch(metadata.profileId, unitProfile));
      return this.updateMetadata(metadata.id, metadata);
    }));
  }

  async getMetadataOfUnit(unit: Unit, createFrom: number): Promise<UnitMetadataValues> {
    const unitMetadataToDelete = await this.unitMetadataToDeleteService.getOneByUnit(createFrom);
    if (unitMetadataToDelete) {
      // the read DTO is a runtime superset of the internal write shape; only
      // the index signature of ItemsMetadataValues blocks direct assignment
      return await this.findOnesMetadata(createFrom) as unknown as UnitMetadataValues;
    }
    return this.resolveValueAsText(unit.metadata as UnitMetadataValues);
  }

  async findOnesMetadata(unitId: number): Promise<UnitFullMetadataDto> {
    const metadata: UnitMetadataValues = {
      profiles: await this.getAllByUnitId(unitId),
      items: await this.unitItemService
        .getAllByUnitIdWithMetadata(unitId) as unknown as UnitMetadataValues['items']
    };
    return await this.resolveValueAsText(metadata) as unknown as UnitFullMetadataDto;
  }
}
