import { Logger } from '@nestjs/common';
import {
  UnitItemDto,
  UnitItemWithMetadataDto
} from '@studio-lite-lib/api-dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import UnitItem from '../entities/unit-item.entity';
import { UnitItemMetadataService } from './unit-item-metadata.service';
import { ItemCommentService } from './item-comment.service';
import UnitCommentUnitItem from '../entities/unit-comment-unit-item.entity';

export class UnitItemService {
  private readonly logger = new Logger(UnitItemService.name);

  constructor(
    @InjectRepository(UnitItem)
    private unitItemRepository: Repository<UnitItem>,
    private unitItemMetadataService: UnitItemMetadataService,
    private itemCommentService: ItemCommentService
  ) {}

  async getAllByUnitId(unitId: number,
                       orderKey: string = 'id',
                       direction: 'DESC' | 'ASC' = 'ASC'): Promise<UnitItemDto[]> {
    return this.unitItemRepository
      .find(
        { where: { unitId: unitId }, order: { [orderKey]: direction } });
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
    const updateItem = await this.getOneByUuid(uuid);
    if (updateItem) {
      const { profiles, ...unitItem } = item;
      await this.unitItemRepository.update(uuid, unitItem);
      const profilesToUpdate = await this.unitItemMetadataService.getAllByItemId(item.uuid);
      const { unchanged, removed, added } = UnitItemService.compare(profilesToUpdate, profiles, 'id');
      unchanged
        .map(metadata => this.unitItemMetadataService.updateItemMetadata(metadata.id, metadata));
      removed
        .map(metadata => this.unitItemMetadataService.removeItemMetadata(metadata.id));
      added
        .map(metadata => this.unitItemMetadataService.addItemMetadata(uuid, metadata));
    }
  }

  async patchItemMetadataCurrentProfile(unitId: number, itemProfile: string) {
    const itemsToUpdate: UnitItemWithMetadataDto[] = await this.getAllByUnitIdWithMetadata(unitId);
    const profiles = itemsToUpdate.flatMap(metadata => metadata.profiles);
    profiles.map(metadata => {
      metadata.isCurrent = metadata.profileId === itemProfile;
      this.unitItemMetadataService.updateItemMetadata(metadata.id, metadata);
      return metadata;
    });
  }

  async addItem(unitId: number, item: UnitItemWithMetadataDto): Promise<string> {
    item.unitId = unitId;
    const { uuid, ...itemWithoutUuid } = item;
    const newItem = this.unitItemRepository.create(itemWithoutUuid);
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

  async findItemCommentsByUnitId(unitId: number): Promise<UnitCommentUnitItem[]> {
    return this.itemCommentService.findItemCommentsByUnitId(unitId);
  }
}
