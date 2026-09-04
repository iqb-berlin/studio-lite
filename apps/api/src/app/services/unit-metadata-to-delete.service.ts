import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import UnitMetadataToDelete from '../entities/unit-metadata-to-delete.entity';

/**
 * The marker table {@link UnitMetadataToDelete}: two calls, one to set the marker for a unit and
 * one to ask for it. A unit that carries it has its metadata in the normalized tables, and the read
 * path takes them instead of the older jsonb column on the unit.
 *
 * Setting the marker takes an optional EntityManager so it can be written inside the transaction
 * that writes the metadata -- it must not appear before the rows it vouches for. Reading it does
 * not: {@link getOneByUnit} always goes through the injected repository and therefore cannot see a
 * marker that transaction has not committed yet.
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
