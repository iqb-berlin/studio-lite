import { Logger } from '@nestjs/common';
import { UnitItemDto } from '@studio-lite-lib/api-dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import UnitItem from '../entities/unit-item.entity';
import Metadata from '../entities/metadata.entity';

export class UnitItemService {
  private readonly logger = new Logger(UnitItemService.name);

  constructor(
    @InjectRepository(UnitItem)
    private unitItemRepository: Repository<UnitItem>,
    @InjectRepository(Metadata)
    private metadataRepository: Repository<Metadata>
  ) {}

  async getAll(): Promise<UnitItemDto[]> {
    this.logger.log('findAll');
    return this.unitItemRepository.find();
  }

  async addItem(unitId: number): Promise<UnitItemDto> {
    const newItem = this.unitItemRepository.create();
    newItem.unitId = unitId;
    await this.unitItemRepository.save(newItem);
    return newItem;
  }

  async removeItem(id: number): Promise<void> {
    await this.unitItemRepository.delete(id);
  }
}
