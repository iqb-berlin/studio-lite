import { Injectable } from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import Unit from "../entities/unit.entity";
import {CreateUnitDto, UnitInListDto, UnitMetadataDto} from "@studio-lite-lib/api-dto";

@Injectable()
export class UnitService {
  constructor(
    @InjectRepository(Unit)
    private unitsRepository: Repository<Unit>,
  ) {}

  async findAll(workspaceId: number): Promise<UnitInListDto[]> {
    return await this.unitsRepository.find({
      where: {workspaceId: workspaceId},
      order: {groupName: 'ASC', key: 'ASC'},
      select: ['id', 'key', 'name', 'groupName']
    })
  }

  async create(workspaceId: number, unit: CreateUnitDto ): Promise<number> {
    unit['workspaceId'] = workspaceId;
    const newUnit = await this.unitsRepository.create(unit);
    await this.unitsRepository.save(newUnit);
    return newUnit.id;
  }

  async findOnesMetadata(workspaceId: number, unitId: number): Promise<UnitMetadataDto> {
    return this.unitsRepository.findOne({
      where: {workspaceId: workspaceId, id: unitId},
      select: ['id', 'key', 'name', 'groupName', 'editor', 'schemer',
        'player', 'description', 'lastChangedMetadata', "lastChangedDefinition", 'lastChangedScheme']
    })
  }

  async patchMetadata(workspaceId: number, unitId: number, newData: UnitMetadataDto): Promise<void> {
    const unitToUpdate = await this.unitsRepository.findOne({
      where: {workspaceId: workspaceId, id: unitId}});
    const dataKeys = Object.keys(newData);
    if (dataKeys.indexOf('key') >= 0) unitToUpdate.key = newData.key;
    if (dataKeys.indexOf('name') >= 0) unitToUpdate.name = newData.name;
    if (dataKeys.indexOf('description') >= 0) unitToUpdate.description = newData.description;
    if (dataKeys.indexOf('editor') >= 0) unitToUpdate.editor = newData.editor;
    if (dataKeys.indexOf('player') >= 0) unitToUpdate.player = newData.player;
    await this.unitsRepository.save(unitToUpdate);
  }

  async remove(id: number | number[]): Promise<void> {
    await this.unitsRepository.delete(id);
  }
}
