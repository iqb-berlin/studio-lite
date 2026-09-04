import { Logger } from '@nestjs/common';
import { UnitItemMetadataDto } from '@studio-lite-lib/api-dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { HIDDEN_PROFILE_ORDER } from '@studio-lite/shared-code';
import UnitItemMetadata from '../entities/unit-item-metadata.entity';

/**
 * The metadata rows of items -- the same CRUD as {@link UnitMetadataService} one level down, over
 * {@link UnitItemMetadata}, and equally transaction-aware.
 */
export class UnitItemMetadataService {
  private readonly logger = new Logger(UnitItemMetadataService.name);

  constructor(
    @InjectRepository(UnitItemMetadata)
    private unitItemMetadataRepository: Repository<UnitItemMetadata>
  ) {}

  // When a transactional manager is passed the write joins that transaction;
  // otherwise the injected repository (default connection) is used.
  private repo(manager?: EntityManager): Repository<UnitItemMetadata> {
    return manager ? manager.getRepository(UnitItemMetadata) : this.unitItemMetadataRepository;
  }

  async getAll(): Promise<UnitItemMetadataDto[]> {
    return this.unitItemMetadataRepository.find();
  }

  async getAllByItemId(unitItemUuid: string, manager?: EntityManager): Promise<UnitItemMetadataDto[]> {
    return this.repo(manager).findBy({ unitItemUuid: unitItemUuid });
  }

  async addItemMetadata(unitItemUuid: string, metadata: UnitItemMetadataDto, manager?: EntityManager): Promise<number> {
    metadata.unitItemUuid = unitItemUuid;
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

  async updateItemMetadata(id: number, metadata: UnitItemMetadataDto, manager?: EntityManager): Promise<number> {
    await this.repo(manager).update(id, { ...metadata, changedAt: new Date() });
    return id;
  }

  async removeItemMetadata(id: number, manager?: EntityManager): Promise<void> {
    await this.repo(manager).delete(id);
  }
}
