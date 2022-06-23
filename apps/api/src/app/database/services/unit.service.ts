import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateUnitDto, RequestReportDto,
  UnitDefinitionDto,
  UnitInListDto,
  UnitMetadataDto,
  UnitSchemeDto
} from '@studio-lite-lib/api-dto';
import Unit from '../entities/unit.entity';
import UnitDefinition from '../entities/unit-definition.entity';

@Injectable()
export class UnitService {
  constructor(
    @InjectRepository(Unit)
    private unitsRepository: Repository<Unit>,
    @InjectRepository(UnitDefinition)
    private unitDefinitionsRepository: Repository<UnitDefinition>
  ) {}

  async findAll(workspaceId: number): Promise<UnitInListDto[]> {
    return this.unitsRepository.find({
      where: { workspaceId: workspaceId },
      order: { groupName: 'ASC', key: 'ASC' },
      select: ['id', 'key', 'name', 'groupName']
    });
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
    if (unit.createFrom) {
      const unitSourceMetadata = await this.findOnesMetadata(workspaceId, unit.createFrom);
      if (unitSourceMetadata) {
        newUnit.description = unitSourceMetadata.description;
        // todo: newUnit.metadata = unitSource.metadata;
        newUnit.player = unitSourceMetadata.player;
        newUnit.editor = unitSourceMetadata.editor;
        newUnit.schemer = unitSourceMetadata.schemer;
        newUnit.groupName = unitSourceMetadata.groupName;
        await this.unitsRepository.save(newUnit);
        const unitSourceDefinition = await this.findOnesDefinition(workspaceId, unit.createFrom);
        if (unitSourceDefinition) {
          await this.patchDefinition(workspaceId, newUnit.id, unitSourceDefinition);
        }
      }
    }
    return newUnit.id;
  }

  async findOnesMetadata(workspaceId: number, unitId: number): Promise<UnitMetadataDto> {
    return this.unitsRepository.findOne({
      where: { workspaceId: workspaceId, id: unitId },
      select: ['id', 'key', 'name', 'groupName', 'editor', 'schemer', 'metadata',
        'player', 'description', 'lastChangedMetadata', 'lastChangedDefinition', 'lastChangedScheme']
    });
  }

  async findAllWithMetadata(workspaceId: number): Promise<UnitMetadataDto[]> {
    return this.unitsRepository.find({
      where: { workspaceId: workspaceId },
      order: { key: 'ASC' },
      select: ['id', 'key', 'name', 'groupName', 'editor', 'schemer', 'metadata',
        'player', 'description', 'lastChangedMetadata', 'lastChangedDefinition', 'lastChangedScheme']
    });
  }

  async patchMetadata(workspaceId: number, unitId: number, newData: UnitMetadataDto): Promise<void> {
    const unitToUpdate = await this.unitsRepository.findOne({ where: { workspaceId: workspaceId, id: unitId } });
    const dataKeys = Object.keys(newData);
    if (dataKeys.indexOf('key') >= 0) unitToUpdate.key = newData.key;
    if (dataKeys.indexOf('name') >= 0) unitToUpdate.name = newData.name;
    if (dataKeys.indexOf('description') >= 0) unitToUpdate.description = newData.description;
    if (dataKeys.indexOf('editor') >= 0) unitToUpdate.editor = newData.editor;
    if (dataKeys.indexOf('player') >= 0) unitToUpdate.player = newData.player;
    if (dataKeys.indexOf('schemer') >= 0) unitToUpdate.schemer = newData.schemer;
    await this.unitsRepository.save(unitToUpdate);
  }

  async patchWorkspace(workspaceId: number, unitIds: number[], newWorkspace: number): Promise<RequestReportDto> {
    const reports = await Promise.all(unitIds.map(async unitId => {
      const unitToUpdate = await this.unitsRepository.findOne({
        where: { workspaceId: workspaceId, id: unitId },
        select: ['id', 'key', 'workspaceId']
      });
      const existingUnit = await this.unitsRepository.findOne({
        where: { workspaceId: newWorkspace, key: unitToUpdate.key },
        select: ['id']
      });
      if (existingUnit) return <RequestReportDto>{
        source: 'unit-patch-workspace',
        messages: [
          {
            objectKey: unitToUpdate.key,
            messageKey: 'unit-patch.duplicate-unit-id'
          }
        ]
      };
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
      if (r.messages.length > 0) report.messages = [...report.messages, ...r.messages]
    });
    return report;
  }

  async remove(id: number | number[]): Promise<void> {
    await this.unitsRepository.delete(id);
  }

  async findOnesDefinition(workspaceId: number, unitId: number): Promise<UnitDefinitionDto> {
    const unit = await this.unitsRepository.findOne({
      where: { workspaceId: workspaceId, id: unitId },
      select: ['definitionId', 'variables']
    });
    const returnUnit: UnitDefinitionDto = {
      variables: unit.variables, definition: ''
    };
    if (unit.definitionId) {
      const unitDefinition = await this.unitDefinitionsRepository.findOne(unit.definitionId);
      if (unitDefinition) returnUnit.definition = unitDefinition.data;
    }
    return returnUnit;
  }

  async findOnesScheme(workspaceId: number, unitId: number): Promise<UnitSchemeDto> {
    const unit = await this.unitsRepository.findOne({
      where: { workspaceId: workspaceId, id: unitId },
      select: ['scheme', 'schemeType', 'variables']
    });
    return {
      variables: unit.variables,
      scheme: unit.scheme,
      schemeType: unit.schemeType
    };
  }

  async patchDefinition(workspaceId: number, unitId: number, unitDefinitionDto: UnitDefinitionDto) {
    const unitToUpdate = await this.unitsRepository.findOne({
      where: { workspaceId: workspaceId, id: unitId }
    });
    let newUnitDefinitionId = -1;
    if (unitToUpdate.definitionId) {
      const unitDefinitionToUpdate = await this.unitDefinitionsRepository.findOne(unitToUpdate.definitionId);
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

  async patchScheme(workspaceId: number, unitId: number, unitSchemeDto: UnitSchemeDto) {
    const unitToUpdate = await this.unitsRepository.findOne({
      where: { workspaceId: workspaceId, id: unitId }
    });
    unitToUpdate.scheme = unitSchemeDto.scheme;
    unitToUpdate.schemeType = unitSchemeDto.schemeType;
    await this.unitsRepository.save(unitToUpdate);
  }
}
