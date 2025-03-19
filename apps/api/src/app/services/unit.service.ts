import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import {
  CreateUnitDto,
  RequestReportDto,
  UnitDefinitionDto,
  UnitByDefinitionIdDto,
  UnitInListDto,
  UnitPropertiesDto,
  UnitSchemeDto,
  UnitMetadataValues,
  UnitMetadataDto,
  UnitItemWithMetadataDto,
  UnitFullMetadataDto, UnitItemMetadataDto, MetadataDto
} from '@studio-lite-lib/api-dto';
import { VariableCodingData } from '@iqb/responses';
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

  async getUnitIdsByWorkspaceId(workspaceId: number): Promise<number[]> {
    const units = await this.unitsRepository
      .find({
        where: { workspaceId: workspaceId },
        select: ['id']
      });
    return units.map(unit => unit.id);
  }

  async findAll(): Promise<UnitByDefinitionIdDto[]> {
    this.logger.log('Retrieving units for workspaceId');
    const units = await this.unitsRepository.find({
      order: { definitionId: 'ASC' },
      select: {
        definitionId: true,
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
    const newUnits = units.map(unit => unit as UnitByDefinitionIdDto);
    return Promise.all(newUnits.map(async unit => {
      const workspace = workspaces
        .find(w => w.id === unit.workspaceId);
      if (workspace) {
        unit.workspaceName = workspace.name;
      }
      return unit;
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
        state: true
      }
    }) as UnitInListDto[];
    if (userId && withLastSeenCommentTimeStamp) {
      units = await Promise.all(units.map(async unit => {
        const comment = await this.unitCommentService.findOnesLastChangedComment(unit.id);
        return {
          ...unit,
          lastCommentChangedAt:
            comment ? comment.changedAt : new Date(2022, 6),
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

  async create(workspaceId: number, unit: CreateUnitDto, user: User, addComments: boolean): Promise<number> {
    const existingUnitId = await this.unitsRepository.findOne({
      where: { workspaceId: workspaceId, key: unit.key },
      select: ['id']
    });
    if (existingUnitId) return 0;
    const newUnit = this.unitsRepository.create(unit);
    newUnit.workspaceId = workspaceId;
    newUnit.groupName = unit.groupName;
    await this.unitsRepository.save(newUnit);

    const workspaceUsers = await this.workspaceUserRepository
      .find({ where: { workspaceId: workspaceId } });
    await Promise.all(workspaceUsers.map(async workspaceUser => {
      await this.unitUserService.createUnitUser(workspaceUser.userId, newUnit.id);
    }));
    const displayName = await this.getDisplayNameForUser(user.id);
    if (unit.createFrom) {
      const unitSourceData = await this.unitsRepository.findOne({
        where: { id: unit.createFrom },
        select: ['id', 'editor', 'schemer', 'metadata', 'schemeType',
          'player', 'description', 'reference', 'transcript']
      });
      if (unitSourceData) {
        newUnit.description = unitSourceData.description;
        newUnit.transcript = unitSourceData.transcript;
        newUnit.reference = unitSourceData.reference;
        newUnit.player = unitSourceData.player;
        newUnit.editor = unitSourceData.editor;
        newUnit.schemer = unitSourceData.schemer;
        newUnit.schemeType = unitSourceData.schemeType;
        newUnit.lastChangedDefinitionUser = displayName;
        newUnit.lastChangedMetadataUser = displayName;
        newUnit.lastChangedSchemeUser = displayName;
        await this.unitsRepository.save(newUnit);

        const metadata = await this.getMetadataOfUnit(unit);
        const workspace = await this.workspaceRepository.findOne({ where: { id: workspaceId } });
        newUnit.metadata = UnitService.setCurrentProfiles(
          workspace.settings?.unitMDProfile,
          workspace.settings?.itemMDProfile,
          metadata as UnitFullMetadataDto
        );
        await this.addMetadata(newUnit.id, metadata as UnitFullMetadataDto);

        const unitSourceDefinition = await this.findOnesDefinition(unit.createFrom);
        if (unitSourceDefinition) {
          await this.patchDefinition(newUnit.id, unitSourceDefinition, user);
        }
        const unitSourceScheme = await this.findOnesScheme(unit.createFrom);
        if (unitSourceScheme && unitSourceScheme.scheme) {
          await this.patchScheme(newUnit.id, unitSourceScheme, user);
        }
        if (addComments) await this.unitCommentService.copyComments(unit.createFrom, newUnit.id);
      }
    } else {
      if (unit.player) newUnit.player = unit.player;
      if (unit.editor) newUnit.editor = unit.editor;
      if (unit.schemer) newUnit.schemer = unit.schemer;
      newUnit.groupName = unit.groupName;
      newUnit.lastChangedDefinitionUser = displayName;
      newUnit.lastChangedMetadataUser = displayName;
      newUnit.lastChangedSchemeUser = displayName;
      await this.unitsRepository.save(newUnit);
    }
    return newUnit.id;
  }

  async findOnesProperties(unitId: number, workspaceId: number): Promise<UnitPropertiesDto> {
    this.logger.log(`Returning metadata for unit wit id: ${unitId}`);
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId }
    });
    const unit = await this.unitsRepository.findOne({
      where: { id: unitId },
      select: [
        'id', 'key', 'name', 'groupName', 'editor', 'schemer', 'metadata', 'schemeType',
        'player', 'description', 'transcript', 'reference',
        'lastChangedMetadata', 'lastChangedDefinition', 'lastChangedScheme', 'state',
        'lastChangedMetadataUser', 'lastChangedDefinitionUser', 'lastChangedSchemeUser'
      ]
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
    unitProfile: string, itemProfile: string, metadata: UnitFullMetadataDto
  ): UnitFullMetadataDto {
    if (metadata.profiles) {
      metadata.profiles = metadata.profiles.map((profile => UnitService
        .setCurrentProfile(unitProfile, profile) as UnitMetadataDto));
    }
    if (metadata.items) {
      metadata.items.forEach(item => {
        if (item.profiles) {
          item.profiles = item.profiles.map(profile => UnitService
            .setCurrentProfile(itemProfile, profile) as UnitItemMetadataDto);
        }
      });
    }
    return metadata;
  }

  private async getDisplayNameForUser(id: number): Promise<string> {
    const user = await this.usersRepository.findOne({
      where: { id: id }
    });
    return user ? UnitService.getUserDisplayName(user) : 'unknown';
  }

  static getUserDisplayName(user: User): string {
    const displayName = user.lastName && user.lastName.trim() ? user.lastName.trim() : user.name.trim();
    return user.firstName && user.firstName.trim() ? `${displayName}, ${user.firstName.trim()}` : displayName;
  }

  private static setCurrentProfile(profileId: string, profile: MetadataDto): MetadataDto {
    return {
      ...profile,
      isCurrent: profile.profileId === profileId
    };
  }

  async patchUnitMetadata(unitId: number, profiles: UnitMetadataDto[]): Promise<void> {
    const profilesToUpdate = await this.unitMetadataService.getAllByUnitId(unitId);
    const { unchanged, removed, added } = UnitItemService.compare(profilesToUpdate, profiles, 'id');
    unchanged
      .map(metadata => this.unitMetadataService.updateMetadata(metadata.id, metadata));
    removed
      .map(metadata => this.unitMetadataService.removeMetadata(metadata.id));
    added
      .map(metadata => this.unitMetadataService.addMetadata(unitId, metadata));
  }

  async patchItemsMetadata(unitId: number, items: UnitItemWithMetadataDto[]): Promise<void> {
    const itemsToUpdate = await this.unitItemService.getAllByUnitIdWithMetadata(unitId);
    const { unchanged, removed, added } = UnitItemService.compare(itemsToUpdate, items, 'uuid');
    unchanged
      .map(item => this.unitItemService.updateItem(item.uuid, item));
    removed
      .map(item => this.unitItemService.removeItem(item.uuid));
    added
      .map(item => this.unitItemService.addItem(unitId, item));
  }

  async addMetadata(unitId: number, metadata: UnitFullMetadataDto): Promise<void> {
    const profiles = metadata.profiles || [];
    profiles
      .map(profile => this.unitMetadataService.addMetadata(unitId, profile as UnitMetadataDto));
    const items = metadata.items || [];
    items
      .map(item => this.unitItemService.addItem(unitId, item as UnitItemWithMetadataDto));

    await this.unitMetadataToDeleteService.upsertOneForUnit(unitId);
  }

  async patchMetadata(unitId: number, metadata: UnitMetadataValues): Promise<void> {
    const profiles = metadata.profiles || [];
    await this.patchUnitMetadata(unitId, profiles as UnitMetadataDto[]);

    const items = metadata.items || [];
    await this.patchItemsMetadata(unitId, items as unknown as UnitItemWithMetadataDto[]);

    await this.unitMetadataToDeleteService.upsertOneForUnit(unitId);
  }

  async patchUnit(unitId: number, newData: UnitPropertiesDto, user: User): Promise<void> {
    await this.patchUnitProperties(unitId, newData, user);
    const dataKeys = Object.keys(newData);
    if (dataKeys.indexOf('metadata') >= 0) {
      await this.patchMetadata(unitId, newData.metadata);
    }
  }

  async patchUnitProperties(unitId: number, newData: UnitPropertiesDto, user: User): Promise<void> {
    const unit = await this.unitsRepository.findOne({ where: { id: unitId } });
    const displayName = await this.getDisplayNameForUser(user.id);
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
    unit.lastChangedMetadataUser = displayName;
    if (dataKeys.indexOf('lastChangedDefinition') >= 0) {
      unit.lastChangedDefinition = newData.lastChangedDefinition;
      unit.lastChangedDefinitionUser = displayName;
    }
    if (dataKeys.indexOf('lastChangedScheme') >= 0) {
      unit.lastChangedScheme = newData.lastChangedScheme;
      unit.lastChangedSchemeUser = displayName;
    }
    const unitToUpdate = await this.repairDefinition(unit, user);
    await this.unitsRepository.save(unitToUpdate);
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

      const unitToUpdate = await this.repairDefinition(unit, user);
      await this.unitsRepository.save(unitToUpdate);
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
    profilesToUpdate.map(metadata => {
      metadata.isCurrent = metadata.profileId === unitProfile;
      this.unitMetadataService.updateMetadata(metadata.id, metadata);
      return metadata;
    });
  }

  async copy(unitIds: number[], newWorkspace: number, user: User, addComments: boolean): Promise<RequestReportDto> {
    const reports = await Promise.all(unitIds.map(async unitId => {
      const unitToCopy = await this.unitsRepository.findOne({
        where: { id: unitId }
      });
      const keysToIgnore = ['id', 'groupName', 'key', 'definitionId', 'state'];
      const keysToCopy = Object.keys(unitToCopy)
        .filter(key => !keysToIgnore.includes(key))
        .reduce((obj, key) => {
          obj[key] = unitToCopy[key];
          return obj;
        }, { key: unitToCopy.key, groupName: '', createFrom: unitToCopy.id });
      const newUnitId = await this.create(
        newWorkspace,
        { ...keysToCopy, createFrom: unitToCopy.id },
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

  async findOnesDefinition(unitId: number): Promise<UnitDefinitionDto> {
    const unit = await this.unitsRepository.findOne({
      where: { id: unitId }
    });
    this.logger.log(`Retrieving unit definition for unit with id ${unitId} and workspaceId ${unit.workspaceId}`);
    const returnUnit: UnitDefinitionDto = {
      variables: unit.variables, definition: ''
    };
    if (unit.definitionId) {
      const unitDefinition = await this.unitDefinitionsRepository.findOne({
        where: { id: unit.definitionId }
      });
      if (unitDefinition) returnUnit.definition = unitDefinition.data;
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

  async deleteState(workspaceGroup:number, state_id: string): Promise<void> {
    const workspaces = await this.workspaceRepository.find({
      where: { groupId: workspaceGroup }
    });
    let units = [];
    // eslint-disable-next-line no-restricted-syntax
    for await (const workspace of workspaces) {
      this.logger.log('workspace', JSON.stringify(workspace));
      const unit = await this.unitsRepository.find({
        where: { state: state_id, workspaceId: workspace.id }
      });
      this.logger.log('unit', JSON.stringify(unit));
      if (unit.length) units = [...units, unit[0]];
    }
    if (units.length) {
      // eslint-disable-next-line no-restricted-syntax
      for await (const unit of units) {
        unit.state = '';
        await this.unitsRepository.save(unit);
      }
    }
  }

  async removeUnitState(id: number, user: User): Promise<void> {
    const unit = await this.unitsRepository.findOne({ where: { id: id } });
    const unitToUpdate = await this.repairDefinition(unit, user);
    await this.unitsRepository.save({ ...unitToUpdate, state: '0' }
    );
  }

  async patchDefinition(unitId: number, unitDefinitionDto: UnitDefinitionDto, user: User) {
    const unit = await this.unitsRepository.findOne({
      where: { id: unitId }
    });

    const displayName = await this.getDisplayNameForUser(user.id);
    const unitToUpdate = await this.repairDefinition(unit, user);

    let newUnitDefinitionId = -1;
    unitToUpdate.lastChangedDefinition = new Date();
    unitToUpdate.lastChangedDefinitionUser = displayName;
    if (unitToUpdate.definitionId) {
      const unitDefinitionToUpdate = await this.unitDefinitionsRepository.findOne({
        where: { id: unitToUpdate.definitionId }
      });
      unitDefinitionToUpdate.data = unitDefinitionDto.definition;
      await this.unitDefinitionsRepository.save(unitDefinitionToUpdate);
    } else {
      const newUnitDefinition = this.unitDefinitionsRepository.create({ data: unitDefinitionDto.definition });
      await this.unitDefinitionsRepository.save(newUnitDefinition);
      newUnitDefinitionId = newUnitDefinition.id;
    }
    if (unitDefinitionDto.variables || newUnitDefinitionId >= 0) {
      if (newUnitDefinitionId >= 0) unitToUpdate.definitionId = newUnitDefinitionId;
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
      schemeObject.variableCodings.forEach(item => {
        if (item.sourceType === 'BASE' || item.sourceType === 'BASE_NO_VALUE') {
          item.alias = variableAliasId.find(v => v.id === item.id)?.alias;
        }
      });
      return JSON.stringify(schemeObject);
    }
    return scheme;
  }

  async patchScheme(unitId: number, unitSchemeDto: UnitSchemeDto, user: User) {
    const unit = await this.unitsRepository.findOne({
      where: { id: unitId }
    });
    const displayName = await this.getDisplayNameForUser(user.id);
    const unitToUpdate = await this.repairDefinition(unit, user);
    unitToUpdate.scheme = unitSchemeDto.scheme;
    const scheme = JSON.parse(unitSchemeDto.scheme);
    UnitService.updateMetadataVariableId(unitToUpdate, scheme.variableCodings
      .map((item: VariableCodingData) => ({ id: item.id, alias: item.alias || item.id })));
    unitToUpdate.schemeType = unitSchemeDto.schemeType;
    unitToUpdate.lastChangedScheme = new Date();
    unitToUpdate.lastChangedSchemeUser = displayName;
    await this.unitsRepository.save(unitToUpdate);
  }

  private async repairDefinition(unit: Unit, user: User): Promise<Unit> {
    const unitDefinitionId = unit.definitionId;
    if (unitDefinitionId) {
      const sameUnits = await this.unitsRepository.find({
        where: { definitionId: unitDefinitionId }
      });
      if (sameUnits.length > 1) {
        const unitDefinition = await this.unitDefinitionsRepository.findOne({
          where: { id: unitDefinitionId }
        });
        if (unitDefinition) {
          const displayName = await this.getDisplayNameForUser(user.id);
          const newUnitDefinition = this.unitDefinitionsRepository.create({ data: unitDefinition.data });
          await this.unitDefinitionsRepository.save(newUnitDefinition);
          this.logger.log(`Repair: New UnitDefinition ${newUnitDefinition.id} for unit ${unit.id} created`);
          unit.definitionId = newUnitDefinition.id;
          unit.lastChangedDefinition = new Date();
          unit.lastChangedDefinitionUser = displayName;
        }
      }
    }
    return unit;
  }

  private async getMetadataOfUnit(unit: CreateUnitDto): Promise<UnitMetadataValues | UnitFullMetadataDto> {
    const unitMetadataToDelete = this.unitMetadataToDeleteService.getOneByUnit(unit.createFrom);
    if (unitMetadataToDelete) {
      return this.findOnesMetadata(unit.createFrom);
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
