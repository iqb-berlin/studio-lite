import { Logger } from '@nestjs/common';
import {
  UnitItemDto, UnitItemMetadataDto,
  UnitItemWithMetadataDto
} from '@studio-lite-lib/api-dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import UnitItem from '../entities/unit-item.entity';
import { UnitItemMetadataService } from './unit-item-metadata.service';

export class UnitItemService {
  private readonly logger = new Logger(UnitItemService.name);

  constructor(
    @InjectRepository(UnitItem)
    private unitItemRepository: Repository<UnitItem>,
    private unitItemMetadataService: UnitItemMetadataService
  ) {}

  async getAllByUnitId(unitId: number): Promise<UnitItemDto[]> {
    return this.unitItemRepository.findBy({ unitId: unitId });
  }

  async getOneByUuid(uuid: string): Promise<UnitItemDto> {
    return this.unitItemRepository.findOneBy({ uuid: uuid });
  }

  async getAllByUnitIdWithMetadata(unitId: number): Promise<UnitItemWithMetadataDto[]> {
    return Promise.all((await this.getAllByUnitId(unitId))
      .map(async item => ({
        ...item,
        profiles: await this.unitItemMetadataService.getAllByItemId(item.uuid)
      }))
    );
  }

  static compareProfiles(savedMetadata: UnitItemMetadataDto[], newMetadata: UnitItemMetadataDto[]) {
    const newIds = newMetadata
      .map(item => item.id)
      .filter(id => id !== undefined);
    const unchanged = newMetadata
      .filter(metadata => metadata.id !== undefined && newIds.includes(metadata.id));
    const removed = savedMetadata
      .filter(metadata => metadata.id !== undefined && !newIds.includes(metadata.id));
    const added = newMetadata
      .filter(metadata => metadata.id === undefined);
    return { unchanged, removed, added };
  }

  async updateItem(uuid: string, item: UnitItemWithMetadataDto): Promise<void> {
    const updateItem = this.getOneByUuid(uuid);
    if (updateItem) {
      await this.unitItemRepository.update(uuid, item);
      const profilesToUpdate = await this.unitItemMetadataService.getAllByItemId(item.uuid);
      const { unchanged, removed, added } = UnitItemService.compareProfiles(profilesToUpdate, item.profiles);
      unchanged
        .map(metadata => this.unitItemMetadataService.updateItemMetadata(metadata.id, metadata));
      removed
        .map(metadata => this.unitItemMetadataService.removeItemMetadata(metadata.id));
      added
        .map(metadata => this.unitItemMetadataService.addItemMetadata(uuid, metadata));
    }
  }

  async addItem(unitId: number, item: UnitItemWithMetadataDto): Promise<string> {
    item.unitId = unitId;
    const newItem = this.unitItemRepository.create(item);
    await this.unitItemRepository.save(newItem);
    if (item.profiles) {
      item.profiles
        .map(async profile => this.unitItemMetadataService
          .addItemMetadata(newItem.uuid, profile));
    }
    return newItem.uuid;
  }

  async removeItem(id: number): Promise<void> {
    await this.unitItemRepository.delete(id);
  }
}
