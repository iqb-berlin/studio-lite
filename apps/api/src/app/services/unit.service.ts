import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  In, Not, QueryFailedError, Repository
} from 'typeorm';
import {
  CreateUnitDto,
  RequestReportDto,
  UnitInViewDto,
  UnitInListDto,
  UnitMetadataValues,
  UnitPropertiesDto
} from '@studio-lite-lib/api-dto';
import Workspace from '../entities/workspace.entity';
import Unit from '../entities/unit.entity';
import WorkspaceUser from '../entities/workspace-user.entity';
import { UnitUserService } from './unit-user.service';
import { UnitCommentService } from './unit-comment.service';
import User from '../entities/user.entity';
import UnitDropBoxHistory from '../entities/unit-drop-box-history.entity';
import { ProfileFetchCache, UnitMetadataService } from './unit-metadata.service';
import { UnitDefinitionService } from './unit-definition.service';
import { UnitItemService } from './unit-item.service';
import { UnitMetadataToDeleteService } from './unit-metadata-to-delete.service';
import { UnitNotFoundException } from '../exceptions/unit-not-found.exception';
import { UnitKeyExistsException } from '../exceptions/unit-key-exists.exception';

/**
 * The units and their properties -- plus creating and copying a unit, moving it to another
 * workspace, and submitting it to a drop box. What a unit is made of has services of its own:
 * {@link UnitMetadataService} for its metadata and items, {@link UnitDefinitionService} for its
 * definition and coding scheme.
 *
 * Copying is the operation with the most to keep straight: a copy needs new items with new uuids,
 * and comments and notes that pointed at the old ones have to be rewritten to the new -- hence the
 * uuid lookups handed around between here and the comment and note services.
 */
export class UnitService {
  private readonly logger = new Logger(UnitService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Unit)
    private unitsRepository: Repository<Unit>,
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
    private unitMetadataToDeleteService: UnitMetadataToDeleteService,
    private unitDefinitionService: UnitDefinitionService
  ) {}

  async findOne(id: number): Promise<Unit> {
    const unit = await this.unitsRepository.findOne({ where: { id: id } });
    if (!unit) throw new UnitNotFoundException(id, 0, 'GET');
    return unit;
  }

  /** Whether the unit is in the workspace -- false as well for a unit that does not exist. */
  async isInWorkspace(unitId: number, workspaceId: number): Promise<boolean> {
    return this.unitsRepository.exists({ where: { id: unitId, workspaceId: workspaceId } });
  }

  /** Those of the units that are not in the workspace -- unknown ids among them. Empty when all are. */
  async idsNotInWorkspace(unitIds: number[], workspaceId: number): Promise<number[]> {
    const distinctIds = [...new Set(unitIds)];
    if (distinctIds.length === 0) return [];
    const found = await this.unitsRepository.find({
      where: { id: In(distinctIds), workspaceId: workspaceId },
      select: ['id']
    });
    const foundIds = new Set(found.map(unit => unit.id));
    return distinctIds.filter(id => !foundIds.has(id));
  }

  /** The workspace of each unit, by unit id. A unit that does not exist is missing from the map. */
  async workspacesOfUnits(unitIds: number[]): Promise<Map<number, number>> {
    const distinctIds = [...new Set(unitIds)];
    if (distinctIds.length === 0) return new Map();
    const units = await this.unitsRepository.find({
      where: { id: In(distinctIds) },
      select: ['id', 'workspaceId']
    });
    return new Map(units.map(unit => [unit.id, unit.workspaceId]));
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
    // A unit is created here, never overwritten: an id sent along would have save() update that
    // unit -- in whatever workspace it is -- and move it into this one (#1779)
    const newUnit = this.unitsRepository.create({ ...unit, id: undefined });
    newUnit.workspaceId = workspaceId;
    newUnit.groupName = unit.groupName;
    newUnit.uuid = crypto.randomUUID();
    await this.unitsRepository.save(newUnit);

    if (unit.createFrom) {
      const unitSourceData = await this.unitsRepository.findOne({
        where: { id: unit.createFrom },
        select: ['id', 'key', 'editor', 'schemer', 'metadata', 'scheme', 'schemeType',
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
        // Taken over as it is, not through patchScheme: that refuses a scheme without a list of codings,
        // as units from before 9.3.0 may carry, and failed the copy halfway (#2057)
        newUnit.scheme = unitSourceData.scheme;
        newUnit.schemeType = unitSourceData.schemeType;
        newUnit.lastChangedDefinitionUser = unitSourceData.lastChangedDefinitionUser;
        newUnit.lastChangedMetadataUser = await this.getLastChangedMetadataUser(unitSourceData, newUnit.key, user);
        newUnit.lastChangedSchemeUser = unitSourceData.lastChangedSchemeUser;
        newUnit.lastChangedDefinition = unitSourceData.lastChangedDefinition || null;
        newUnit.lastChangedMetadata = UnitService.getLastChangedMetadata(unitSourceData, newUnit.key);
        newUnit.lastChangedScheme = unitSourceData.lastChangedScheme || null;
        await this.unitsRepository.save(newUnit);

        const rawMetadata = await this.unitMetadataService.getMetadataOfUnit(newUnit, unit.createFrom);
        const workspace = await this.workspaceRepository.findOne({ where: { id: workspaceId } });
        const metadata = UnitMetadataService.setCurrentProfiles(
          workspace.settings?.unitMDProfile,
          workspace.settings?.itemMDProfile,
          rawMetadata
        );
        const itemUuidLookups = await this.unitMetadataService.copyItemsWithMetadata(newUnit.id, metadata);

        const unitSourceDefinition = await this.unitDefinitionService.findOnesDefinition(unit.createFrom);
        if (unitSourceDefinition.definition || newUnit.lastChangedDefinition) {
          await this.unitDefinitionService.patchDefinition(
            newUnit.id,
            unitSourceDefinition,
            newUnit.lastChangedDefinitionUser,
            newUnit.lastChangedDefinition);
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

  /**
   * Adopts the universal id from an imported unit index so a unit keeps its identity across
   * instances (spec: uuid helps to find variants/versions). If another unit already holds the uuid
   * (e.g. the same export was imported twice), the unit keeps the fresh uuid assigned by create().
   */
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
    return this.unitMetadataService.getModifiedMetadataForUnit(unit, workspace);
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
    const profileCache: ProfileFetchCache = new Map();
    return Promise.all(units.map(async unit => this.unitMetadataService
      .getModifiedMetadataForUnit(unit, workspace, profileCache)));
  }

  /**
   * The metadata and coding scheme of every unit of the workspace, read from the same source as the
   * export reads them -- the metadata tables for a unit with the marker, its column otherwise.
   *
   * Only what decides content is read: the unit-level profiles and the items themselves, not the
   * items' own profiles and not the profile lookups that fill in `valueAsText`. Four queries for the
   * whole workspace, so that opening the export dialog does not fire a burst of queries per unit
   * next to the properties request it already makes.
   */
  async findAllExportSources(
    workspaceId: number
  ): Promise<{ id: number; metadata: UnitMetadataValues; scheme: string }[]> {
    const units = await this.unitsRepository.find({
      where: { workspaceId: workspaceId },
      select: ['id', 'metadata', 'scheme']
    });
    const markedUnitIds = await this.unitMetadataToDeleteService
      .findMarkedUnitIds(units.map(unit => unit.id));
    const marked = [...markedUnitIds];
    const [profiles, items] = await Promise.all([
      this.unitMetadataService.getAllByUnitIds(marked),
      this.unitItemService.getAllByUnitIds(marked)
    ]);
    return units.map(unit => ({
      id: unit.id,
      metadata: markedUnitIds.has(unit.id) ?
        {
          profiles: profiles.filter(profile => profile.unitId === unit.id),
          items: items.filter(item => item.unitId === unit.id) as unknown as UnitMetadataValues['items']
        } :
        unit.metadata as UnitMetadataValues,
      scheme: unit.scheme
    }));
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

  async patchUnit(unitId: number, newData: UnitPropertiesDto, userName: string | null): Promise<void> {
    await this.patchUnitProperties(unitId, newData, userName);
    const dataKeys = Object.keys(newData);
    if (dataKeys.indexOf('metadata') >= 0) {
      await this.unitMetadataService.patchMetadata(unitId, newData.metadata, userName);
    }
  }

  async patchUnitProperties(unitId: number, newData: UnitPropertiesDto, userName: string): Promise<void> {
    const unit = await this.unitsRepository.findOne({ where: { id: unitId } });
    const dataKeys = Object.keys(newData);
    if (dataKeys.indexOf('key') >= 0) {
      if (typeof newData.key === 'string' && newData.key !== unit.key) await this.assertKeyIsFree(unit, newData.key);
      unit.key = newData.key;
    }
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

  /**
   * A renamed unit must not take a key another unit of its workspace carries (#1842). Creating and
   * copying already refuse that; renaming in the properties did not. Compared as the form compares,
   * ignoring case and surrounding blanks.
   */
  private async assertKeyIsFree(unit: Unit, key: string): Promise<void> {
    const normalisedKey = key.toUpperCase().trim();
    const unitsOfWorkspace = await this.unitsRepository.find({
      where: { workspaceId: unit.workspaceId },
      select: ['id', 'key']
    });
    if (unitsOfWorkspace.some(other => other.id !== unit.id && other.key?.toUpperCase().trim() === normalisedKey)) {
      throw new UnitKeyExistsException(unit.id, unit.workspaceId, key);
    }
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
      // The submission to undo is the latest one not yet returned. A unit can have been submitted
      // here before, from another workspace, and returned there; that older row used to be picked
      // just as well and sent the unit back to the wrong workspace (#1806).
      const submission = await this.unitDropBoxHistoryRepository.findOne({
        where: { unitId: unitId, targetWorkspaceId: workspaceId, returned: false },
        order: { changedAt: 'DESC' }
      });
      // Created in the drop box, moved into it, or the workspace it came from is gone along with
      // its submission: there is nowhere to return it to (#1793)
      if (!submission) return this.notReturned(unitId, 'unit-patch.not-submitted');
      // Submitting and returning stay within a group (#1805). After either workspace has been moved
      // into another group the unit stays in the drop box; moving it is what crosses groups (#2027).
      if (!await this.inSameGroup(submission.sourceWorkspaceId, workspaceId)) {
        return this.notReturned(unitId, 'unit-patch.other-group');
      }
      return this.patchWorkspace([unitId], submission.sourceWorkspaceId, user, workspaceId, 'return');
    }));
    return {
      source: 'unit-return-submitted',
      messages: reports.map(r => r.messages).flat()
    };
  }

  private async notReturned(unitId: number, messageKey: string): Promise<RequestReportDto> {
    const unit = await this.unitsRepository.findOne({ where: { id: unitId }, select: ['key'] });
    return {
      source: 'unit-return-submitted',
      messages: [{ objectKey: unit?.key ?? `${unitId}`, messageKey }]
    };
  }

  /** Whether the two workspaces belong to one group -- trivially so when they are the same. */
  private async inSameGroup(workspaceId: number, otherWorkspaceId: number): Promise<boolean> {
    const workspaces = await this.workspaceRepository.find({
      where: { id: In([workspaceId, otherWorkspaceId]) },
      select: { id: true, groupId: true }
    });
    return new Set(workspaces.map(workspace => workspace.groupId)).size === 1;
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

      await this.unitMetadataService.patchMetadataCurrentProfile(
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
}
