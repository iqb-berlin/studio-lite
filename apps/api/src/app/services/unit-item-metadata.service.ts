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
    this.logger.log('findAll');
    return this.unitItemMetadataRepository.find();
  }

  async getAllByItemId(unitItemUuid: string): Promise<UnitItemMetadataDto[]> {
    this.logger.log('findAll');
    return this.unitItemMetadataRepository.findBy({ unitItemUuid: unitItemUuid });
  }

  async addItemMetadata(unitItemUuid: string, metadata: UnitItemMetadataDto): Promise<number> {
    metadata.unitItemUuid = unitItemUuid;
    const newItemMetadata = this.unitItemMetadataRepository.create(metadata);
    await this.unitItemMetadataRepository.save(newItemMetadata);
    return newItemMetadata.id;
  }

  async updateItemMetadata(id: number, metadata: UnitItemMetadataDto): Promise<number> {
    await this.unitItemMetadataRepository.update(id, metadata);
    return id;
  }

  async removeItemMetadata(id: number): Promise<void> {
    await this.unitItemMetadataRepository.delete(id);
  }
}
