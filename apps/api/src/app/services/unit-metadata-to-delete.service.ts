import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import UnitMetadataToDelete from '../entities/unit-metadata-to-delete.entity';

/**
 * The marker table {@link UnitMetadataToDelete}: two calls, one to set the marker for a unit and
 * one to ask for it. A unit that carries it has its metadata in the normalized tables, and the read
 * path takes them instead of the older jsonb column on the unit.
 *
 * Both take an optional EntityManager so the marker can be set inside the transaction that writes
 * the metadata -- it must not appear before the rows it vouches for.
 */
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
