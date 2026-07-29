import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import UnitMetadataToDelete from '../entities/unit-metadata-to-delete.entity';

@Injectable()
export class UnitMetadataToDeleteService {
  constructor(
    @InjectRepository(UnitMetadataToDelete)
    private unitMetadataToDeleteRepository: Repository<UnitMetadataToDelete>) {}

  async upsertOneForUnit(unitId: number, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(UnitMetadataToDelete) : this.unitMetadataToDeleteRepository;
    const now = new Date();
    await repo
      .upsert(<UnitMetadataToDelete>{ unitId: unitId, createdAt: now, changedAt: now }, ['unitId']);
  }

  async getOneByUnit(unitId: number): Promise<UnitMetadataToDelete> {
    return this.unitMetadataToDeleteRepository.findOneBy({ unitId: unitId });
  }
}
