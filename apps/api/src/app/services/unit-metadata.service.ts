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
    const newItemMetadata = this.unitMetadataRepository.create(metadataWithoutId);
    await this.unitMetadataRepository.save(newItemMetadata);
    return newItemMetadata.id;
  }

  async updateMetadata(id: number, metadata: UnitMetadataDto): Promise<number> {
    await this.unitMetadataRepository.update(id, metadata);
    return id;
  }

  async removeMetadata(id: number): Promise<void> {
    await this.unitMetadataRepository.delete(id);
  }
}
