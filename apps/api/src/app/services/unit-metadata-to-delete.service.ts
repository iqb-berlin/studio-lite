import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import UnitMetadataToDelete from '../entities/unit-metadata-to-delete.entity';

@Injectable()
export class UnitMetadataToDeleteService {
  constructor(
    @InjectRepository(UnitMetadataToDelete)
    private unitMetadataToDeleteRepository: Repository<UnitMetadataToDelete>) {}

  async upsertOneForUnit(unitId: number) {
    await this.unitMetadataToDeleteRepository
      .upsert(<UnitMetadataToDelete>{ unitId: unitId, changedAt: new Date() }, ['unitId']);
  }

  async getOneByUnit(unitId: number): Promise<UnitMetadataToDelete> {
    return this.unitMetadataToDeleteRepository.findOneBy({ unitId: unitId });
  }
}
