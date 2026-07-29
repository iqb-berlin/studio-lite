import { Logger } from '@nestjs/common';
import { UnitMetadataDto } from '@studio-lite-lib/api-dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { HIDDEN_PROFILE_ORDER } from '@studio-lite/shared-code';
import UnitMetadata from '../entities/unit-metadata.entity';

export class UnitMetadataService {
  private readonly logger = new Logger(UnitMetadataService.name);

  constructor(
    @InjectRepository(UnitMetadata)
    private unitMetadataRepository: Repository<UnitMetadata>
  ) {}

  // When a transactional manager is passed the write joins that transaction;
  // otherwise the injected repository (default connection) is used.
  private repo(manager?: EntityManager): Repository<UnitMetadata> {
    return manager ? manager.getRepository(UnitMetadata) : this.unitMetadataRepository;
  }

  async getAll(): Promise<UnitMetadataDto[]> {
    return this.unitMetadataRepository.find();
  }

  async getAllByUnitId(unitId: number, manager?: EntityManager): Promise<UnitMetadataDto[]> {
    return this.repo(manager).findBy({ unitId: unitId });
  }

  async addMetadata(unitId: number, metadata: UnitMetadataDto, manager?: EntityManager): Promise<number> {
    metadata.unitId = unitId;
    const { id, ...metadataWithoutId } = metadata;
    // created_at and changed_at are NOT NULL columns without a DB default and the
    // client cannot supply them (the profile form re-emits without them), so they
    // are set here — otherwise the INSERT violates NOT NULL. `order` defaults to
    // -1 (hidden) when the client omits it.
    const now = new Date();
    const newItemMetadata = this.repo(manager).create({
      ...metadataWithoutId,
      order: metadataWithoutId.order ?? HIDDEN_PROFILE_ORDER,
      createdAt: metadataWithoutId.createdAt ?? now,
      changedAt: now
    });
    await this.repo(manager).save(newItemMetadata);
    return newItemMetadata.id;
  }

  async updateMetadata(id: number, metadata: UnitMetadataDto, manager?: EntityManager): Promise<number> {
    await this.repo(manager).update(id, { ...metadata, changedAt: new Date() });
    return id;
  }

  async removeMetadata(id: number, manager?: EntityManager): Promise<void> {
    await this.repo(manager).delete(id);
  }
}
