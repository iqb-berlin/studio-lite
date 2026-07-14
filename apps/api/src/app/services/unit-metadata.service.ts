import { Logger } from '@nestjs/common';
import { UnitMetadataDto } from '@studio-lite-lib/api-dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import UnitMetadata from '../entities/unit-metadata.entity';

export class UnitMetadataService {
  private readonly logger = new Logger(UnitMetadataService.name);

  constructor(
    @InjectRepository(UnitMetadata)
    private unitMetadataRepository: Repository<UnitMetadata>
  ) {}

  async getAll(): Promise<UnitMetadataDto[]> {
    return this.unitMetadataRepository.find();
  }

  async getAllByUnitId(unitId: number): Promise<UnitMetadataDto[]> {
    return this.unitMetadataRepository.findBy({ unitId: unitId });
  }

  async addMetadata(unitId: number, metadata: UnitMetadataDto): Promise<number> {
    metadata.unitId = unitId;
    const { id, ...metadataWithoutId } = metadata;
    // created_at, changed_at and is_current are NOT NULL columns without a DB
    // default. The client cannot supply them (the profile form re-emits without
    // them), so they are set here — otherwise the INSERT violates NOT NULL.
    const now = new Date();
    const newItemMetadata = this.unitMetadataRepository.create({
      ...metadataWithoutId,
      isCurrent: metadataWithoutId.isCurrent ?? false,
      createdAt: metadataWithoutId.createdAt ?? now,
      changedAt: now
    });
    await this.unitMetadataRepository.save(newItemMetadata);
    return newItemMetadata.id;
  }

  async updateMetadata(id: number, metadata: UnitMetadataDto): Promise<number> {
    await this.unitMetadataRepository.update(id, { ...metadata, changedAt: new Date() });
    return id;
  }

  async removeMetadata(id: number): Promise<void> {
    await this.unitMetadataRepository.delete(id);
  }
}
