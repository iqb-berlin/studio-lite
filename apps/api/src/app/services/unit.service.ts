import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  EntityManager, In, Not, QueryFailedError, Repository
} from 'typeorm';
import {
  CreateUnitDto,
  ProfileValues,
  RequestReportDto,
  UnitInViewDto,
  UnitDefinitionDto,
  UnitDefinitionFullDto,
  UnitFullMetadataDto,
  UnitInListDto,
  UnitItemWithMetadataDto,
  UnitMetadataDto,
  UnitMetadataValues,
  UnitPropertiesDto,
  UnitSchemeDto
} from '@studio-lite-lib/api-dto';
import { VariableCodingData } from '@iqbspecs/coding-scheme/coding-scheme.interface';
import { profileIdsMatch, reconcileProfilesByProfileId } from '@studio-lite/shared-code';
import Workspace from '../entities/workspace.entity';
import Unit from '../entities/unit.entity';
import UnitDefinition from '../entities/unit-definition.entity';
import WorkspaceUser from '../entities/workspace-user.entity';
import { UnitUserService } from './unit-user.service';
import { UnitCommentService } from './unit-comment.service';
import User from '../entities/user.entity';
import UnitDropBoxHistory from '../entities/unit-drop-box-history.entity';
import { UnitMetadataService } from './unit-metadata.service';
import { UnitItemService } from './unit-item.service';
import { UnitMetadataToDeleteService } from './unit-metadata-to-delete.service';
import { UnitNotFoundException } from '../exceptions/unit-not-found.exception';
import { ItemUuidLookup } from '../interfaces/item-uuid-lookup.interface';

export class UnitService {
  private readonly logger = new Logger(UnitService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Unit)
    private unitsRepository: Repository<Unit>,
    @InjectRepository(UnitDefinition)
    private unitDefinitionsRepository: Repository<UnitDefinition>,
    @InjectRepository(WorkspaceUser)
    private workspaceUserRepository: Repository<WorkspaceUser>,
    @InjectRepository(Workspace)
    private workspaceRepository: Repository<Workspace>,
    @InjectRepository(UnitDropBoxHistory)
    private unitDropBoxHistoryRepository: Repository<UnitDropBoxHistory>,
    private unitUserService: UnitUserService,
    private unitCommentService: UnitCommentService,
    private unitMetadataService: UnitMetadataService,
    private unitItemService: UnitItemService,
    private unitMetadataToDeleteService: UnitMetadataToDeleteService
  ) {}

  async findOne(id: number): Promise<Unit> {
    const unit = await this.unitsRepository.findOne({ where: { id: id } });
    if (!unit) throw new UnitNotFoundException(id, 0, 'GET');
    return unit;
  }

  async getUnitIdsByWorkspaceId(workspaceId: number): Promise<number[]> {
    const units = await this.unitsRepository
      .find({
        where: { workspaceId: workspaceId },
        select: ['id']
      });
    return units.map(unit => unit.id);
  }

  async getAllUnits(): Promise<UnitInViewDto[]> {
    this.logger.log('Retrieving all units');
    return this.unitsRepository.find({
      order: { id: 'ASC' },
      select: {
        key: true,
        name: true,
        groupName: true,
        id: true,
        workspaceId: true,
        lastChangedDefinition: true,
        lastChangedDefinitionUser: true,
        lastChangedMetadata: true,
        lastChangedMetadataUser: true,
        lastChangedScheme: true,
        lastChangedSchemeUser: true,
        metadata: false,
        variables: false
      }
    });
  }

  async findAll(): Promise<UnitInViewDto[]> {
    this.logger.log('Retrieving units for workspaceId');
    const units = await this.unitsRepository.find({
      select: {
        key: true,
        name: true,
        groupName: true,
        id: true,
        workspaceId: true,
        lastChangedDefinition: true,
        lastChangedMetadata: true,
        lastChangedScheme: true,
        metadata: false,
        variables: false
      }
    });
    const workspaces = await this.workspaceRepository.find();
    const newUnits = units.map(unit => unit as UnitInViewDto);
    return Promise.all(newUnits.map(async unit => {
      const workspace = workspaces
        .find(w => w.id === unit.workspaceId);
      if (workspace) {
        unit.workspaceName = workspace.name;
      }
      return unit;
    }));
  }

  async findAllForGroup(workspaceGroupId: number): Promise<UnitInViewDto[]> {
    const workspaces = await this.workspaceRepository.find({
      where: { groupId: workspaceGroupId },
      select: ['id', 'name']
    });
    const workspaceIds = workspaces.map(w => w.id);
    if (workspaceIds.length === 0) return [];
    const units = await this.unitsRepository.find({
      where: { workspaceId: In(workspaceIds) },
      order: { key: 'ASC' },
      select: {
        key: true,
        name: true,
        id: true,
        workspaceId: true,
        lastChangedMetadata: true,
        lastChangedDefinition: true,
        lastChangedScheme: true,
        lastChangedMetadataUser: true,
        lastChangedDefinitionUser: true,
        lastChangedSchemeUser: true
      }
    }) as UnitInViewDto[];
    // add workspace name to units
    return units.map(unit => ({
      ...unit,
      workspaceName: workspaces.find(w => w.id === unit.workspaceId)?.name || ''
    }));
  }

  async findAllForWorkspace(workspaceId: number,
                            userId: number = null,
                            withLastSeenCommentTimeStamp: boolean = false,
                            targetWorkspaceId: number = 0,
                            filterTargetWorkspaceId: boolean = false): Promise<UnitInListDto[]> {
    this.logger.log(`Retrieving units for workspaceId ${workspaceId}`);
    let units = await this.unitsRepository.find({
      where: { workspaceId: workspaceId },
      order: { key: 'ASC' },
      select: {
        id: true,
        key: true,
        name: true,
        groupName: true,
        state: true,
        lastChangedDefinition: true,
        lastChangedDefinitionUser: true,
        lastChangedMetadata: true,
        lastChangedMetadataUser: true,
        lastChangedScheme: true,
        lastChangedSchemeUser: true
      }
    }) as UnitInListDto[];
    if (userId && withLastSeenCommentTimeStamp) {
      units = await Promise.all(units.map(async unit => {
        const comment = await this.unitCommentService.findOnesLastChangedComment(unit.id, userId);
        return {
          ...unit,
          lastCommentChangedAt:
            comment ? comment.changedAt : new Date(0),
          lastSeenCommentChangedAt:
            await this.unitUserService.findLastSeenCommentTimestamp(userId, unit.id)
        };
      }));
    }
    if (targetWorkspaceId) {
      units = await Promise.all(units.map(async unit => {
        const history = await this.unitDropBoxHistoryRepository.findOne({
          where: [
            { unitId: unit.id, targetWorkspaceId: targetWorkspaceId },
            { unitId: unit.id, sourceWorkspaceId: targetWorkspaceId }
          ]
        });
        return {
          ...unit,
          targetWorkspaceId: history?.targetWorkspaceId || null,
          sourceWorkspaceId: history?.sourceWorkspaceId || null,
          returned: history?.returned || false
        };
      }));
    }
    if (filterTargetWorkspaceId) {
      units = units.filter(unit => unit.targetWorkspaceId === workspaceId);
    }
    return units;
  }

  private async getLastChangedMetadataUser(unit: Unit, newKey: string, user: User): Promise<string> {
    if (unit.key !== newKey) {
      return this.getDisplayNameForUser(user.id);
    }
    return unit.lastChangedMetadataUser;
  }

  private static getLastChangedMetadata(unit: Unit, newKey: string): Date {
    if (unit.key !== newKey || !unit.lastChangedMetadata) {
      return new Date();
    }
    return unit.lastChangedMetadata;
  }

  async create(workspaceId: number, unit: CreateUnitDto, user: User, addComments: boolean): Promise<number> {
    const existingUnitId = await this.unitsRepository.findOne({
      where: { workspaceId: workspaceId, key: unit.key },
      select: ['id']
    });
    if (existingUnitId) return 0;
    const newUnit = this.unitsRepository.create(unit);
    newUnit.workspaceId = workspaceId;
    newUnit.groupName = unit.groupName;
    newUnit.uuid = crypto.randomUUID();
    await this.unitsRepository.save(newUnit);

    if (unit.createFrom) {
      const unitSourceData = await this.unitsRepository.findOne({
        where: { id: unit.createFrom },
        select: ['id', 'key', 'editor', 'schemer', 'metadata', 'schemeType',
          'player', 'description', 'reference', 'transcript',
          'lastChangedMetadata', 'lastChangedDefinition', 'lastChangedScheme',
          'lastChangedMetadataUser', 'lastChangedDefinitionUser', 'lastChangedSchemeUser']
      });
      if (unitSourceData) {
        newUnit.description = unitSourceData.description;
        newUnit.transcript = unitSourceData.transcript;
        newUnit.reference = unitSourceData.reference;
        newUnit.player = unitSourceData.player;
        newUnit.metadata = unitSourceData.metadata;
        newUnit.editor = unitSourceData.editor;
        newUnit.schemer = unitSourceData.schemer;
        newUnit.schemeType = unitSourceData.schemeType;
        newUnit.lastChangedDefinitionUser = unitSourceData.lastChangedDefinitionUser;
        newUnit.lastChangedMetadataUser = await this.getLastChangedMetadataUser(unitSourceData, newUnit.key, user);
        newUnit.lastChangedSchemeUser = unitSourceData.lastChangedSchemeUser;
        newUnit.lastChangedDefinition = unitSourceData.lastChangedDefinition || null;
        newUnit.lastChangedMetadata = UnitService.getLastChangedMetadata(unitSourceData, newUnit.key);
        newUnit.lastChangedScheme = unitSourceData.lastChangedScheme || null;
        await this.unitsRepository.save(newUnit);

        const metadata = await this.getMetadataOfUnit(newUnit, unit.createFrom);
        const workspace = await this.workspaceRepository.findOne({ where: { id: workspaceId } });
        UnitService.setCurrentProfiles(
          workspace.settings?.unitMDProfile,
          workspace.settings?.itemMDProfile,
          metadata
        );
        const itemUuidLookups = await this.copyItemsWithMetadata(newUnit.id, metadata);

        const unitSourceDefinition = await this.findOnesDefinition(unit.createFrom);
        if (unitSourceDefinition.definition || newUnit.lastChangedDefinition) {
          await this.patchDefinition(
            newUnit.id,
            unitSourceDefinition,
            newUnit.lastChangedDefinitionUser,
            newUnit.lastChangedDefinition);
        }
        const unitSourceScheme = await this.findOnesScheme(unit.createFrom);
        if (unitSourceScheme && unitSourceScheme.scheme) {
          await this.patchScheme(
            newUnit.id,
            unitSourceScheme,
            newUnit.lastChangedSchemeUser,
            newUnit.lastChangedScheme);
        }
        if (addComments) await this.unitCommentService.copyComments(unit.createFrom, newUnit.id, itemUuidLookups);
      }
    } else {
      if (unit.player) newUnit.player = unit.player;
      if (unit.editor) newUnit.editor = unit.editor;
      if (unit.schemer) newUnit.schemer = unit.schemer;
      newUnit.groupName = unit.groupName;
      newUnit.lastChangedMetadataUser = await this.getDisplayNameForUser(user.id);
      await this.unitsRepository.save(newUnit);
    }

    // unit_user-Einträge NACH copyComments bzw. Erstellung anlegen, damit
    // createUnitUser die kopierten/neuen Kommentare sieht.
    // Für den kopierenden User: lastSeenCommentChangedAt aus dem Quell-Workspace übernehmen
    // (spiegelt sein bisheriges Icon-Verhalten). Für alle anderen: Standard aus createUnitUser.
    const workspaceUsers = await this.workspaceUserRepository
      .find({ where: { workspaceId: workspaceId } });
    const initiatingUserLastSeen = unit.createFrom ?
      await this.unitUserService.findLastSeenCommentTimestamp(user.id, unit.createFrom) :
      undefined;
    await Promise.all(workspaceUsers.map(async workspaceUser => {
      if (unit.createFrom && workspaceUser.userId === user.id && initiatingUserLastSeen !== undefined) {
        // Kopierender User: Status aus Quell-Workspace übernehmen
        await this.unitUserService.createUnitUser(workspaceUser.userId, newUnit.id, initiatingUserLastSeen);
      } else {
        // Alle anderen: standardmäßig new Date(2022, 6)
        await this.unitUserService.createUnitUser(workspaceUser.userId, newUnit.id);
      }
    }));
    return newUnit.id;
  }

  // Adopts the universal id from an imported unit index so a unit keeps its
  // identity across instances (spec: uuid helps to find variants/versions).
  // If another unit already holds the uuid (e.g. the same export was imported
  // twice), the unit keeps the fresh uuid assigned by create().
  async adoptUuidIfFree(unitId: number, uuid: string): Promise<void> {
    const existing = await this.unitsRepository.findOne({
      where: { uuid },
      select: ['id']
    });
    if (existing) return;
    try {
      await this.unitsRepository.update(unitId, { uuid });
    } catch (error) {
      const isUniqueViolation = error instanceof QueryFailedError &&
        (error.driverError as { code?: string })?.code === '23505';
      if (!isUniqueViolation) {
        this.logger.warn(`Could not adopt uuid '${uuid}' for unit ${unitId}: ${error}`);
      }
      // on unique violation a concurrent import claimed the uuid first – keep the fresh one
    }
  }

  async ensureUuid(unitId: number): Promise<string> {
    return this.unitsRepository.manager.transaction(async manager => {
      const unit = await manager.findOne(Unit, {
        where: { id: unitId },
        select: ['id', 'uuid'],
        lock: { mode: 'pessimistic_write' }
      });
      if (!unit) throw new UnitNotFoundException(unitId, 0, 'GET');
      if (unit.uuid) return unit.uuid;
      unit.uuid = crypto.randomUUID();
      await manager.save(unit);
      return unit.uuid;
    });
  }

  async findOnesProperties(unitId: number, workspaceId: number): Promise<UnitPropertiesDto> {
    this.logger.log(`Returning metadata for unit wit id: ${unitId}`);
    const unit = await this.unitsRepository.findOne({
      where: { id: unitId, workspaceId: workspaceId },
      select: [
        'id', 'key', 'name', 'groupName', 'editor', 'schemer', 'metadata', 'schemeType',
        'player', 'description', 'transcript', 'reference', 'uuid',
        'lastChangedMetadata', 'lastChangedDefinition', 'lastChangedScheme', 'state',
        'lastChangedMetadataUser', 'lastChangedDefinitionUser', 'lastChangedSchemeUser'
      ]
    });
    if (!unit) throw new UnitNotFoundException(unitId, workspaceId, 'GET');
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId }
    });
    return this.getModifiedMetadataForUnit(unit, workspace);
  }

  async findAllWithProperties(workspaceId: number): Promise<UnitPropertiesDto[]> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId }
    });
    const units = await this.unitsRepository.find({
      where: { workspaceId: workspaceId },
      order: { key: 'ASC' },
      select: [
        'id', 'key', 'name', 'groupName', 'editor', 'schemer', 'metadata', 'schemeType',
        'player', 'description', 'transcript', 'reference', 'scheme', 'variables',
        'lastChangedMetadata', 'lastChangedDefinition', 'lastChangedScheme', 'state',
        'lastChangedMetadataUser', 'lastChangedDefinitionUser', 'lastChangedSchemeUser'
      ]
    });
    return Promise.all(units.map(async unit => this.getModifiedMetadataForUnit(unit, workspace)));
  }

  private async getModifiedMetadataForUnit(unit: Unit, workspace: Workspace): Promise<Unit> {
    const unitMetadataToDelete = await this.unitMetadataToDeleteService.getOneByUnit(unit.id);
    if (unitMetadataToDelete) {
      unit.metadata = await this.findOnesMetadata(unit.id);
    } else {
      unit.metadata = UnitService.setCurrentProfiles(
        workspace.settings?.unitMDProfile,
        workspace.settings?.itemMDProfile,
        unit.metadata);
    }
    return unit;
  }

  static setCurrentProfiles(
    unitProfile: string, itemProfile: string, metadata: UnitMetadataValues
  ): UnitMetadataValues {
    if (metadata.profiles) {
      metadata.profiles = metadata.profiles.map(profile => UnitService
        .setCurrentProfile(unitProfile, profile));
    }
    if (metadata.items) {
      metadata.items.forEach(item => {
        if (item.profiles) {
          item.profiles = item.profiles.map(profile => UnitService
            .setCurrentProfile(itemProfile, profile));
        }
      });
    }
    return metadata;
  }

  async getDisplayNameForUser(id: number): Promise<string> {
    const user = await this.usersRepository.findOne({
      where: { id: id }
    });
    return user ? UnitService.getUserDisplayName(user) : 'unknown';
  }

  static getUserDisplayName(user: User): string {
    const displayName = user.lastName && user.lastName.trim() ? user.lastName.trim() : user.name.trim();
    return user.firstName && user.firstName.trim() ? `${displayName}, ${user.firstName.trim()}` : displayName;
  }

  private static setCurrentProfile<T extends ProfileValues>(profileId: string, profile: T): T {
    return {
      ...profile,
      isCurrent: profileIdsMatch(profile.profileId, profileId)
    };
  }

  // Reconcile unit metadata by profileId (the profile form re-emits without the
  // row id), so an edit updates the existing row instead of delete + re-insert.
  async patchUnitMetadata(unitId: number, profiles: UnitMetadataDto[], manager?: EntityManager): Promise<void> {
    const existingProfiles = await this.unitMetadataService.getAllByUnitId(unitId, manager);
    await reconcileProfilesByProfileId(existingProfiles, profiles, {
      remove: id => this.unitMetadataService.removeMetadata(id, manager),
      update: (id, metadata) => this.unitMetadataService.updateMetadata(id, metadata, manager),
      add: metadata => this.unitMetadataService.addMetadata(unitId, metadata, manager)
    });
  }

  async patchItemsMetadata(
    unitId: number,
    items: UnitItemWithMetadataDto[],
    manager?: EntityManager
  ): Promise<void> {
    const itemsToUpdate = await this.unitItemService.getAllByUnitIdWithMetadata(unitId, manager);
    const { unchanged, removed, added } = UnitItemService.compare(itemsToUpdate, items, 'uuid');
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
      .map(profile => this.unitMetadataService
        .addMetadata(unitId, profile as UnitMetadataDto)));
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

  // The whole metadata save runs in one transaction so a mid-sequence failure
  // (e.g. a constraint error on one profile) rolls back every write instead of
  // leaving the unit's profiles/items half-updated.
  async patchMetadata(unitId: number, metadata: UnitMetadataValues): Promise<void> {
    const unit = await this.unitsRepository.findOne({ where: { id: unitId } });
    const workspace = await this.workspaceRepository.findOne({ where: { id: unit.workspaceId } });
    const unitProfile = workspace?.settings?.unitMDProfile || '';
    const itemProfile = workspace?.settings?.itemMDProfile || '';

    const profiles = (metadata.profiles || []).map(profile => ({
      ...profile,
      isCurrent: profileIdsMatch(profile.profileId, unitProfile)
    }));

    const items = (metadata.items || []).map(item => {
      if (item.profiles) {
        item.profiles = item.profiles.map(profile => ({
          ...profile,
          isCurrent: profileIdsMatch(profile.profileId, itemProfile)
        }));
      }
      return item;
    });

    await this.unitsRepository.manager.transaction(async manager => {
      await this.patchUnitMetadata(unitId, profiles as UnitMetadataDto[], manager);
      await this.patchItemsMetadata(unitId, items as unknown as UnitItemWithMetadataDto[], manager);
      await this.unitMetadataToDeleteService.upsertOneForUnit(unitId, manager);
    });
  }

  async patchUnit(unitId: number, newData: UnitPropertiesDto, userName: string | null): Promise<void> {
    await this.patchUnitProperties(unitId, newData, userName);
    const dataKeys = Object.keys(newData);
    if (dataKeys.indexOf('metadata') >= 0) {
      await this.patchMetadata(unitId, newData.metadata);
    }
  }

  async patchUnitProperties(unitId: number, newData: UnitPropertiesDto, userName: string): Promise<void> {
    const unit = await this.unitsRepository.findOne({ where: { id: unitId } });
    const dataKeys = Object.keys(newData);
    if (dataKeys.indexOf('key') >= 0) unit.key = newData.key;
    if (dataKeys.indexOf('name') >= 0) unit.name = newData.name;
    if (dataKeys.indexOf('description') >= 0) unit.description = newData.description;
    if (dataKeys.indexOf('transcript') >= 0) unit.transcript = newData.transcript;
    if (dataKeys.indexOf('reference') >= 0) unit.reference = newData.reference;
    if (dataKeys.indexOf('editor') >= 0) unit.editor = newData.editor;
    if (dataKeys.indexOf('player') >= 0) unit.player = newData.player;
    if (dataKeys.indexOf('schemer') >= 0) unit.schemer = newData.schemer;
    if (dataKeys.indexOf('schemeType') >= 0) unit.schemeType = newData.schemeType;
    if (dataKeys.indexOf('state') >= 0) unit.state = newData.state;
    if (newData.groupName === '' || (newData.groupName && newData.groupName.length > 0)) {
      unit.groupName = newData.groupName;
    }
    if (dataKeys.indexOf('lastChangedMetadata') >= 0) {
      unit.lastChangedMetadata = newData.lastChangedMetadata;
    } else {
      unit.lastChangedMetadata = new Date();
    }
    unit.lastChangedMetadataUser = userName;
    if (dataKeys.indexOf('lastChangedDefinition') >= 0) {
      unit.lastChangedDefinition = newData.lastChangedDefinition;
      unit.lastChangedDefinitionUser = userName;
    }
    if (dataKeys.indexOf('lastChangedScheme') >= 0) {
      unit.lastChangedScheme = newData.lastChangedScheme;
      unit.lastChangedSchemeUser = userName;
    }
    await this.unitsRepository.save(unit);
  }

  async patchDropBoxHistory(units: number[],
                            dropBoxId: number,
                            workspaceId: number,
                            user: User): Promise<RequestReportDto> {
    return this.patchWorkspace(units, dropBoxId, user, workspaceId, 'submit');
  }

  async patchReturnDropBoxHistory(units: number[],
                                  workspaceId: number,
                                  user: User): Promise<RequestReportDto> {
    const reports = await Promise.all(units.map(async unitId => {
      const unit = await this.unitDropBoxHistoryRepository
        .findOne({ where: { unitId: unitId, targetWorkspaceId: workspaceId } });
      return this.patchWorkspace([unitId], unit.sourceWorkspaceId, user, workspaceId, 'return');
    }));
    return {
      source: 'unit-return-submitted',
      messages: reports.map(r => r.messages).flat()
    };
  }

  async patchWorkspace(unitIds: number[],
                       newWorkspaceId: number,
                       user: User,
                       workspaceId: number,
                       action: string
  ): Promise<RequestReportDto> {
    const reports = await Promise.all(unitIds.map(async unitId => {
      const unit = await this.unitsRepository.findOne({
        where: { id: unitId },
        select: ['id', 'key', 'workspaceId', 'variables', 'metadata']
      });
      const existingUnit = await this.unitsRepository.findOne({
        where: { workspaceId: newWorkspaceId, key: unit.key },
        select: ['id']
      });
      if (existingUnit) {
        return <RequestReportDto>{
          source: 'unit-submit',
          messages: [
            {
              objectKey: unit.key,
              messageKey: 'unit-patch.duplicate-unit-id'
            }
          ]
        };
      }
      unit.workspaceId = newWorkspaceId;
      unit.groupName = '';
      const newWorkspace = await this.workspaceRepository.findOne({
        where: { id: newWorkspaceId },
        select: ['groupId', 'settings']
      });
      if ((action === 'submit' || action === 'return') && workspaceId) {
        await this.unitDropBoxHistoryRepository.upsert({
          unitId: unit.id,
          sourceWorkspaceId: action === 'return' ? newWorkspaceId : workspaceId,
          returned: action === 'return',
          targetWorkspaceId: action === 'return' ? workspaceId : newWorkspaceId,
          changedAt: new Date()
        }, ['unitId', 'sourceWorkspaceId', 'targetWorkspaceId']);
      } else if (action === 'moveTo') {
        await this.unitDropBoxHistoryRepository.delete({ unitId: unit.id });
        const workspace = await this.workspaceRepository.findOne({
          where: { id: workspaceId },
          select: ['groupId']
        });
        if (workspace.groupId !== newWorkspace.groupId) {
          unit.state = '0';
        }
      }

      await this.patchMetadataCurrentProfile(
        unit.id, newWorkspace.settings?.unitMDProfile, newWorkspace.settings?.itemMDProfile
      );
      await this.unitsRepository.save(unit);
      return <RequestReportDto>{
        source: 'unit-submit',
        messages: []
      };
    }));
    const report = <RequestReportDto>{
      source: 'unit-submit',
      messages: []
    };
    reports.forEach(r => {
      if (r.messages.length > 0) report.messages = [...report.messages, ...r.messages];
    });
    return report;
  }

  async patchMetadataCurrentProfile(unitId: number, unitProfile: string = '', itemProfile: string = ''): Promise<void> {
    await this.patchUnitMetadataCurrentProfile(unitId, unitProfile);
    await this.unitItemService.patchItemMetadataCurrentProfile(unitId, itemProfile);
  }

  private async patchUnitMetadataCurrentProfile(unitId: number, unitProfile: string): Promise<void> {
    const profilesToUpdate: UnitMetadataDto[] = await this.unitMetadataService.getAllByUnitId(unitId);
    await Promise.all(profilesToUpdate.map(metadata => {
      metadata.isCurrent = profileIdsMatch(metadata.profileId, unitProfile);
      return this.unitMetadataService.updateMetadata(metadata.id, metadata);
    }));
  }

  async copy(unitIds: number[], newWorkspace: number, user: User, addComments: boolean): Promise<RequestReportDto> {
    const reports = await Promise.all(unitIds.map(async unitId => {
      const unitToCopy = await this.unitsRepository.findOne({
        where: { id: unitId }
      });
      const keysToIgnore = ['id', 'groupName', 'key', 'state', 'uuid'];
      const keysToCopy = Object.keys(unitToCopy)
        .filter(key => !keysToIgnore.includes(key))
        .reduce((obj, key) => {
          obj[key] = unitToCopy[key];
          return obj;
        }, { key: unitToCopy.key, groupName: '', createFrom: unitToCopy.id });
      const newUnitId = await this.create(
        newWorkspace,
        { ...keysToCopy, createFrom: unitToCopy.id, createFromKey: unitToCopy.key },
        user,
        addComments);
      return <RequestReportDto>{
        source: 'unit-copy',
        messages: newUnitId > 0 ? [] : [{
          objectKey: unitToCopy.key,
          messageKey: 'unit-patch.duplicate-unit-id'
        }]
      };
    }));
    const report = <RequestReportDto>{
      source: 'unit-copy',
      messages: []
    };
    reports.forEach(r => {
      if (r.messages.length > 0) report.messages = [...report.messages, ...r.messages];
    });
    return report;
  }

  async remove(id: number | number[]): Promise<void> {
    await this.unitsRepository.delete(id);
  }

  async findUnitDefinitionByUnitId(unitId: number): Promise<UnitDefinitionFullDto> {
    return this.unitDefinitionsRepository.findOne({
      where: { unitId: unitId }
    });
  }

  async findOnesDefinition(unitId: number): Promise<UnitDefinitionDto> {
    const unit = await this.unitsRepository.findOne({
      where: { id: unitId }
    });
    this.logger.log(`Retrieving unit definition for unit with id ${unitId} and workspaceId ${unit.workspaceId}`);
    const returnUnit: UnitDefinitionDto = {
      variables: unit.variables, definition: ''
    };
    const unitDefinition = await this.findUnitDefinitionByUnitId(unitId);
    if (unitDefinition) {
      returnUnit.definition = unitDefinition.data;
    }
    return returnUnit;
  }

  async findOnesScheme(unitId: number): Promise<UnitSchemeDto> {
    const unit = await this.unitsRepository.findOne({
      where: { id: unitId },
      select: ['scheme', 'schemeType', 'variables']
    });
    return {
      variables: unit.variables,
      scheme: unit.scheme,
      schemeType: unit.schemeType
    };
  }

  async patchUnitGroup(id: number, groupName: string, units: number[]): Promise<void> {
    await this.unitsRepository.update({
      workspaceId: id,
      groupName: groupName,
      id: Not(In(units))
    },
    {
      groupName: ''
    });
    await this.unitsRepository.update({
      workspaceId: id,
      id: In(units)
    },
    {
      groupName: groupName
    });
  }

  async removeUnitState(id: number): Promise<void> {
    const unitToUpdate = await this.unitsRepository.findOne({ where: { id: id } });
    await this.unitsRepository.save({ ...unitToUpdate, state: '0' }
    );
  }

  async patchDefinition(unitId: number,
                        unitDefinitionDto: UnitDefinitionDto,
                        userName: string | null,
                        definitionDate: Date | null): Promise<void> {
    const unitToUpdate = await this.unitsRepository.findOne({
      where: { id: unitId }
    });

    unitToUpdate.lastChangedDefinition = definitionDate;
    unitToUpdate.lastChangedDefinitionUser = userName;

    const unitDefinitionToUpdate = await this.findUnitDefinitionByUnitId(unitId);

    if (unitDefinitionToUpdate) {
      unitDefinitionToUpdate.data = unitDefinitionDto.definition;
      await this.unitDefinitionsRepository.save(unitDefinitionToUpdate);
    } else {
      const newUnitDefinition = this.unitDefinitionsRepository
        .create({ data: unitDefinitionDto.definition, unitId });
      await this.unitDefinitionsRepository.save(newUnitDefinition);
    }
    if (unitDefinitionDto.variables) {
      unitToUpdate.variables = unitDefinitionDto.variables;
      const aliasIds = unitDefinitionDto.variables.map(item => ({
        id: item.id,
        alias: item.alias || item.id
      }));
      if (unitToUpdate.scheme) {
        unitToUpdate.scheme = UnitService.getUpdatedScheme(unitToUpdate.scheme, aliasIds);
      }
      UnitService.updateMetadataVariableId(unitToUpdate, aliasIds);
    }
    await this.unitsRepository.save(unitToUpdate);
  }

  private static updateMetadataVariableId(unit: Unit, variableAliasId: { id: string; alias: string }[]): void {
    if (unit.metadata && (unit.metadata as UnitMetadataValues).items) {
      (unit.metadata as UnitMetadataValues).items.forEach(item => {
        if (item.variableReadOnlyId) {
          item.variableId = variableAliasId.find(v => v.id === item.variableReadOnlyId)?.alias;
        }
      });
    }
  }

  private static getUpdatedScheme(scheme: string, variableAliasId: { id: string; alias: string }[]): string {
    const schemeObject = JSON.parse(scheme);
    if (schemeObject.variableCodings) {
      schemeObject.variableCodings = schemeObject.variableCodings.reduce((acc, item) => {
        if (item.sourceType === 'BASE_NO_VALUE') {
          const found = variableAliasId.find(v => v.id === item.id);
          if (found) {
            item.alias = found.alias;
            acc.push(item);
          }
        } else if (item.sourceType === 'BASE') {
          const found = variableAliasId.find(v => v.id === item.id);
          if (found) {
            item.alias = found.alias;
          }
          acc.push(item);
        } else {
          acc.push(item);
        }
        return acc;
      }, []);
      return JSON.stringify(schemeObject);
    }
    return scheme;
  }

  async patchScheme(unitId: number,
                    unitSchemeDto: UnitSchemeDto,
                    userName: string | null,
                    schemeDate: Date | null): Promise<void> {
    const unitToUpdate = await this.unitsRepository.findOne({
      where: { id: unitId }
    });
    unitToUpdate.scheme = unitSchemeDto.scheme;
    const scheme = JSON.parse(unitSchemeDto.scheme);
    UnitService.updateMetadataVariableId(unitToUpdate, scheme.variableCodings
      .map((item: VariableCodingData) => ({ id: item.id, alias: item.alias || item.id })));
    unitToUpdate.schemeType = unitSchemeDto.schemeType;
    unitToUpdate.lastChangedScheme = schemeDate;
    unitToUpdate.lastChangedSchemeUser = userName;
    await this.unitsRepository.save(unitToUpdate);
  }

  private async getMetadataOfUnit(unit: Unit, createFrom: number): Promise<UnitMetadataValues> {
    const unitMetadataToDelete = await this.unitMetadataToDeleteService.getOneByUnit(createFrom);
    if (unitMetadataToDelete) {
      // the read DTO is a runtime superset of the internal write shape; only
      // the index signature of ItemsMetadataValues blocks direct assignment
      return await this.findOnesMetadata(createFrom) as unknown as UnitMetadataValues;
    }
    return unit.metadata;
  }

  async findOnesMetadata(unitId: number): Promise<UnitFullMetadataDto> {
    return {
      profiles: await this.unitMetadataService.getAllByUnitId(unitId),
      items: await this.unitItemService.getAllByUnitIdWithMetadata(unitId)
    };
  }
}
