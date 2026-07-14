import { Logger } from '@nestjs/common';
import { UnitItemMetadataDto } from '@studio-lite-lib/api-dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import UnitItemMetadata from '../entities/unit-item-metadata.entity';

export class UnitItemMetadataService {
  private readonly logger = new Logger(UnitItemMetadataService.name);

  constructor(
    @InjectRepository(UnitItemMetadata)
    private unitItemMetadataRepository: Repository<UnitItemMetadata>
  ) {}

  async getAll(): Promise<UnitItemMetadataDto[]> {
    return this.unitItemMetadataRepository.find();
  }

  async getAllByItemId(unitItemUuid: string): Promise<UnitItemMetadataDto[]> {
    return this.unitItemMetadataRepository.findBy({ unitItemUuid: unitItemUuid });
  }

  async addItemMetadata(unitItemUuid: string, metadata: UnitItemMetadataDto): Promise<number> {
    metadata.unitItemUuid = unitItemUuid;
    const { id, ...metadataWithoutId } = metadata;
    // created_at, changed_at and is_current are NOT NULL columns without a DB
    // default. The client cannot supply them (the profile form re-emits without
    // them), so they are set here — otherwise the INSERT violates NOT NULL.
    const now = new Date();
    const newItemMetadata = this.unitItemMetadataRepository.create({
      ...metadataWithoutId,
      isCurrent: metadataWithoutId.isCurrent ?? false,
      createdAt: metadataWithoutId.createdAt ?? now,
      changedAt: now
    });
    await this.unitItemMetadataRepository.save(newItemMetadata);
    return newItemMetadata.id;
  }

  async updateItemMetadata(id: number, metadata: UnitItemMetadataDto): Promise<number> {
    await this.unitItemMetadataRepository.update(id, { ...metadata, changedAt: new Date() });
    return id;
  }

  async removeItemMetadata(id: number): Promise<void> {
    await this.unitItemMetadataRepository.delete(id);
  }
}
