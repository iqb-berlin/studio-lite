import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateUnitDto,
  RequestReportDto,
  UnitDefinitionDto,
  UnitByDefinitionIdDto,
  UnitInListDto,
  UnitMetadataDto,
  UnitSchemeDto
} from '@studio-lite-lib/api-dto';
import Workspace from '../entities/workspace.entity';
import Unit from '../entities/unit.entity';
import UnitDefinition from '../entities/unit-definition.entity';
import WorkspaceUser from '../entities/workspace-user.entity';
import { UnitUserService } from './unit-user.service';
import { UnitCommentService } from './unit-comment.service';
import User from '../entities/user.entity';

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
    private unitUserService: UnitUserService,
    private unitCommentService: UnitCommentService
  ) {}

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
                            userId:number = null,
                            withLastSeenCommentTimeStamp:boolean = null): Promise<UnitInListDto[]> {
    this.logger.log(`Retrieving units for workspaceId ${workspaceId}`);
    const units = await this.unitsRepository.find({
      where: { workspaceId: workspaceId },
      order: { key: 'ASC' },
      select: {
        id: true,
        key: true,
        name: true,
        groupName: true,
        state: true
      }
    });
    if (userId && withLastSeenCommentTimeStamp) {
      return Promise.all(units.map(async unit => {
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
    return units;
  }

  async create(workspaceId: number, unit: CreateUnitDto, user: User): Promise<number> {
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
        // todo: newUnit.metadata = unitSource.metadata;
        newUnit.player = unitSourceData.player;
        newUnit.editor = unitSourceData.editor;
        newUnit.schemer = unitSourceData.schemer;
        newUnit.schemeType = unitSourceData.schemeType;
        newUnit.lastChangedDefinitionUser = displayName;
        newUnit.lastChangedMetadataUser = displayName;
        newUnit.lastChangedSchemeUser = displayName;
        await this.unitsRepository.save(newUnit);
        const unitSourceDefinition = await this.findOnesDefinition(unit.createFrom);
        if (unitSourceDefinition) {
          await this.patchDefinition(newUnit.id, unitSourceDefinition, user);
        }
        const unitSourceScheme = await this.findOnesScheme(unit.createFrom);
        if (unitSourceScheme && unitSourceScheme.scheme) {
          await this.patchScheme(newUnit.id, unitSourceScheme, user);
        }
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

  async findOnesMetadata(unitId: number, workspaceId: number): Promise<UnitMetadataDto> {
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
    unit.metadata = UnitService.setCurrentProfiles(
      workspace.settings?.unitMDProfile,
      workspace.settings?.itemMDProfile,
      unit.metadata);
    return unit;
  }

  async findAllWithMetadata(workspaceId: number): Promise<UnitMetadataDto[]> {
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
    return Promise.all(units
      .map(async unit => ({
        ...unit,
        metadata: UnitService.setCurrentProfiles(
          workspace.settings?.unitMDProfile,
          workspace.settings?.itemMDProfile,
          unit.metadata)
      })));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static setCurrentProfiles(unitProfile: string, itemProfile: string, metadata: any): any {
    if (metadata.profiles) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      metadata.profiles = metadata.profiles.map((profile: any) => UnitService.setCurrentProfile(unitProfile, profile));
    }
    if (metadata.items) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      metadata.items.forEach((item: any) => {
        if (item.profiles) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          item.profiles = item.profiles.map((profile: any) => UnitService.setCurrentProfile(itemProfile, profile));
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
    const displayName = user.lastName ? user.lastName : user.name;
    return user.firstName ? `${displayName}, ${user.firstName}` : displayName;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static setCurrentProfile(profileId: string, profile: any): any {
    return {
      ...profile,
      isCurrent: profile.profileId === profileId
    };
  }

  async patchMetadata(unitId: number, newData: UnitMetadataDto, user: User): Promise<void> {
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
    if (dataKeys.indexOf('metadata') >= 0) unit.metadata = newData.metadata;
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

  async patchWorkspace(unitIds: number[], newWorkspace: number, user: User): Promise<RequestReportDto> {
    const reports = await Promise.all(unitIds.map(async unitId => {
      const unit = await this.unitsRepository.findOne({
        where: { id: unitId },
        select: ['id', 'key', 'workspaceId', 'variables', 'metadata']
      });
      const existingUnit = await this.unitsRepository.findOne({
        where: { workspaceId: newWorkspace, key: unit.key },
        select: ['id']
      });
      if (existingUnit) {
        return <RequestReportDto>{
          source: 'unit-patch-workspace',
          messages: [
            {
              objectKey: unit.key,
              messageKey: 'unit-patch.duplicate-unit-id'
            }
          ]
        };
      }
      unit.workspaceId = newWorkspace;
      unit.groupName = '';
      const unitToUpdate = await this.repairDefinition(unit, user);
      await this.unitsRepository.save(unitToUpdate);
      return <RequestReportDto>{
        source: 'unit-patch-workspace',
        messages: []
      };
    }));
    const report = <RequestReportDto>{
      source: 'unit-patch-workspace',
      messages: []
    };
    reports.forEach(r => {
      if (r.messages.length > 0) report.messages = [...report.messages, ...r.messages];
    });
    return report;
  }

  async copy(unitIds: number[], newWorkspace: number, user: User): Promise<RequestReportDto> {
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
        user);
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

  async removeUnitState(id: number, user): Promise<void> {
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
      if (unitDefinitionDto.variables) unitToUpdate.variables = unitDefinitionDto.variables;
      if (newUnitDefinitionId >= 0) unitToUpdate.definitionId = newUnitDefinitionId;
      await this.unitsRepository.save(unitToUpdate);
    }
  }

  async patchScheme(unitId: number, unitSchemeDto: UnitSchemeDto, user: User) {
    const unit = await this.unitsRepository.findOne({
      where: { id: unitId }
    });
    const displayName = await this.getDisplayNameForUser(user.id);
    const unitToUpdate = await this.repairDefinition(unit, user);
    unitToUpdate.scheme = unitSchemeDto.scheme;
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
}
