import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateUnitDto, RequestReportDto, UnitDefinitionDto, UnitInListDto, UnitMetadataDto, UnitSchemeDto
} from '@studio-lite-lib/api-dto';
import Unit from '../entities/unit.entity';
import UnitDefinition from '../entities/unit-definition.entity';
import WorkspaceUser from '../entities/workspace-user.entity';
import { UnitUserService } from './unit-user.service';
import { UnitCommentService } from './unit-comment.service';

@Injectable()
export class UnitService {
  private readonly logger = new Logger(UnitService.name);

  constructor(
    @InjectRepository(Unit)
    private unitsRepository: Repository<Unit>,
    @InjectRepository(UnitDefinition)
    private unitDefinitionsRepository: Repository<UnitDefinition>,
    @InjectRepository(WorkspaceUser)
    private workspaceUserRepository: Repository<WorkspaceUser>,
    private unitUserService: UnitUserService,
    private unitCommentService: UnitCommentService
  ) {}

  async findAll(workspaceId: number,
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
        groupName: true
      }
    });
    return Promise.all(units.map(async unit => {
      const comment = await this.unitCommentService.findOnesLastChangedComment(unit.id);
      return {
        ...unit,
        lastCommentChangedAt:
          comment ? comment.changedAt : new Date(2022, 6),
        lastSeenCommentChangedAt:
          withLastSeenCommentTimeStamp ? await this.unitUserService.findLastSeenCommentTimestamp(userId, unit.id) : null
      };
    }));
  }

  async create(workspaceId: number, unit: CreateUnitDto): Promise<number> {
    const existingUnitId = await this.unitsRepository.findOne({
      where: { workspaceId: workspaceId, key: unit.key },
      select: ['id']
    });
    if (existingUnitId) return 0;
    const newUnit = await this.unitsRepository.create(unit);
    newUnit.workspaceId = workspaceId;
    await this.unitsRepository.save(newUnit);

    const workspaceUsers = await this.workspaceUserRepository
      .find({ where: { workspaceId: workspaceId } });
    await Promise.all(workspaceUsers.map(async workspaceUser => {
      await this.unitUserService.createUnitUser(workspaceUser.userId, newUnit.id);
    }));

    if (unit.createFrom) {
      const unitSourceMetadata = await this.findOnesMetadata(unit.createFrom);
      if (unitSourceMetadata) {
        newUnit.description = unitSourceMetadata.description;
        // todo: newUnit.metadata = unitSource.metadata;
        newUnit.player = unitSourceMetadata.player;
        newUnit.editor = unitSourceMetadata.editor;
        newUnit.schemer = unitSourceMetadata.schemer;
        newUnit.schemeType = unitSourceMetadata.schemeType;
        await this.unitsRepository.save(newUnit);
        const unitSourceDefinition = await this.findOnesDefinition(unit.createFrom);
        if (unitSourceDefinition) {
          await this.patchDefinition(newUnit.id, unitSourceDefinition);
        }
        const unitSourceScheme = await this.findOnesScheme(unit.createFrom);
        if (unitSourceScheme) {
          await this.patchScheme(newUnit.id, unitSourceScheme);
        }
      }
    } else {
      if (unit.player) newUnit.player = unit.player;
      if (unit.editor) newUnit.editor = unit.editor;
      if (unit.schemer) newUnit.schemer = unit.schemer;
      await this.unitsRepository.save(newUnit);
    }
    return newUnit.id;
  }

  async findOnesMetadata(unitId: number): Promise<UnitMetadataDto> {
    this.logger.log(`Returning metadata for unit wit id: ${unitId}`);
    return this.unitsRepository.findOne({
      where: { id: unitId },
      select: ['id', 'key', 'name', 'groupName', 'editor', 'schemer', 'metadata', 'schemeType',
        'player', 'description', 'lastChangedMetadata', 'lastChangedDefinition', 'lastChangedScheme']
    });
  }

  async findAllWithMetadata(workspaceId: number): Promise<UnitMetadataDto[]> {
    return this.unitsRepository.find({
      where: { workspaceId: workspaceId },
      order: { key: 'ASC' },
      select: ['id', 'key', 'name', 'groupName', 'editor', 'schemer', 'metadata', 'schemeType',
        'player', 'description', 'lastChangedMetadata', 'lastChangedDefinition', 'lastChangedScheme']
    });
  }

  async patchMetadata(unitId: number, newData: UnitMetadataDto): Promise<void> {
    const unitToUpdate = await this.unitsRepository.findOne({ where: { id: unitId } });
    const dataKeys = Object.keys(newData);
    if (dataKeys.indexOf('key') >= 0) unitToUpdate.key = newData.key;
    if (dataKeys.indexOf('name') >= 0) unitToUpdate.name = newData.name;
    if (dataKeys.indexOf('description') >= 0) unitToUpdate.description = newData.description;
    if (dataKeys.indexOf('editor') >= 0) unitToUpdate.editor = newData.editor;
    if (dataKeys.indexOf('player') >= 0) unitToUpdate.player = newData.player;
    if (dataKeys.indexOf('schemer') >= 0) unitToUpdate.schemer = newData.schemer;
    if (dataKeys.indexOf('schemeType') >= 0) unitToUpdate.schemeType = newData.schemeType;
    if (dataKeys.indexOf('groupName') >= 0) unitToUpdate.groupName = newData.groupName;
    unitToUpdate.lastChangedMetadata = new Date();
    await this.unitsRepository.save(unitToUpdate);
  }

  async patchWorkspace(unitIds: number[], newWorkspace: number): Promise<RequestReportDto> {
    const reports = await Promise.all(unitIds.map(async unitId => {
      const unitToUpdate = await this.unitsRepository.findOne({
        where: { id: unitId },
        select: ['id', 'key', 'workspaceId']
      });
      const existingUnit = await this.unitsRepository.findOne({
        where: { workspaceId: newWorkspace, key: unitToUpdate.key },
        select: ['id']
      });
      if (existingUnit) {
        return <RequestReportDto>{
          source: 'unit-patch-workspace',
          messages: [
            {
              objectKey: unitToUpdate.key,
              messageKey: 'unit-patch.duplicate-unit-id'
            }
          ]
        };
      }
      unitToUpdate.workspaceId = newWorkspace;
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

  async copy(unitIds: number[], newWorkspace: number): Promise<RequestReportDto> {
    const reports = await Promise.all(unitIds.map(async unitId => {
      const unitToCopy = await this.unitsRepository.findOne({
        where: { id: unitId },
        select: ['id', 'key', 'name', 'groupName']
      });
      const newUnitId = await this.create(newWorkspace, {
        key: unitToCopy.key,
        name: unitToCopy.name,
        groupName: unitToCopy.groupName,
        createFrom: unitToCopy.id
      });
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
      where: { id: unitId },
      select: ['definitionId', 'variables']
    });
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

  async patchDefinition(unitId: number, unitDefinitionDto: UnitDefinitionDto) {
    const unitToUpdate = await this.unitsRepository.findOne({
      where: { id: unitId }
    });
    let newUnitDefinitionId = -1;
    unitToUpdate.lastChangedDefinition = new Date();
    if (unitToUpdate.definitionId) {
      const unitDefinitionToUpdate = await this.unitDefinitionsRepository.findOne({
        where: { id: unitToUpdate.definitionId }
      });
      unitDefinitionToUpdate.data = unitDefinitionDto.definition;
      await this.unitDefinitionsRepository.save(unitDefinitionToUpdate);
    } else {
      const newUnitDefinition = await this.unitDefinitionsRepository.create({ data: unitDefinitionDto.definition });
      await this.unitDefinitionsRepository.save(newUnitDefinition);
      newUnitDefinitionId = newUnitDefinition.id;
    }
    if (unitDefinitionDto.variables || newUnitDefinitionId >= 0) {
      if (unitDefinitionDto.variables) unitToUpdate.variables = unitDefinitionDto.variables;
      if (newUnitDefinitionId >= 0) unitToUpdate.definitionId = newUnitDefinitionId;
      await this.unitsRepository.save(unitToUpdate);
    }
  }

  async patchScheme(unitId: number, unitSchemeDto: UnitSchemeDto) {
    const unitToUpdate = await this.unitsRepository.findOne({
      where: { id: unitId }
    });
    unitToUpdate.scheme = unitSchemeDto.scheme;
    unitToUpdate.schemeType = unitSchemeDto.schemeType;
    unitToUpdate.lastChangedScheme = new Date();
    await this.unitsRepository.save(unitToUpdate);
  }
}
