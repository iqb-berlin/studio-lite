import { Logger } from '@nestjs/common';
import {
  UnitItemDto,
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

  static compare<T>(savedItems: T[], newItems: T[], key: string): { unchanged: T[]; removed: T[]; added: T[]; } {
    const newIds = newItems
      .map(item => item[key])
      .filter(uuid => uuid !== undefined);
    const unchanged = newItems
      .filter(item => item[key] !== undefined && newIds.includes(item[key]));
    const removed = savedItems
      .filter(item => item[key] !== undefined && !newIds.includes(item[key]));
    const added = newItems
      .filter(item => item[key] === undefined);
    return { unchanged, removed, added };
  }

  async updateItem(uuid: string, item: UnitItemWithMetadataDto): Promise<void> {
    const updateItem = this.getOneByUuid(uuid);
    if (updateItem) {
      await this.unitItemRepository.update(uuid, item);
      const profilesToUpdate = await this.unitItemMetadataService.getAllByItemId(item.uuid);
      const { unchanged, removed, added } = UnitItemService.compare(profilesToUpdate, item.profiles, 'id');
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

  async removeItem(uuid: string): Promise<void> {
    await this.unitItemRepository.delete(uuid);
  }
}
