import { Logger } from '@nestjs/common';
import {
  UnitItemDto, UnitItemInViewDto, UnitItemMetadataDto, UnitItemWithMetadataDto
} from '@studio-lite-lib/api-dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { profileIdsMatch, reconcileProfilesByProfileId } from '@studio-lite/shared-code';
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

  // When a transactional manager is passed the write joins that transaction;
  // otherwise the injected repository (default connection) is used.
  private repo(manager?: EntityManager): Repository<UnitItem> {
    return manager ? manager.getRepository(UnitItem) : this.unitItemRepository;
  }

  async getAll(): Promise<UnitItemDto[]> {
    return this.unitItemRepository.find();
  }

  async findAllForGroup(workspaceGroupId: number): Promise<UnitItemInViewDto[]> {
    return this.unitItemRepository.find({
      relations: ['unit', 'unit.workspace'],
      where: { unit: { workspaceId: In(await this.getWorkspaceIds(workspaceGroupId)) } }
    }).then(items => items.map(item => ({
      ...item,
      unitKey: item.unit?.key || '',
      unitName: item.unit?.name || '',
      workspaceId: item.unit?.workspaceId || 0,
      workspaceName: item.unit?.workspace?.name || ''
    })));
  }

  private async getWorkspaceIds(workspaceGroupId: number): Promise<number[]> {
    return this.unitItemRepository.manager.getRepository('Workspace').find({
      where: { groupId: workspaceGroupId },
      select: ['id']
    }).then(workspaces => workspaces.map(w => w.id));
  }

  async getAllByUnitId(unitId: number,
                       orderKey: string = 'id',
                       direction: 'DESC' | 'ASC' = 'ASC',
                       manager?: EntityManager): Promise<UnitItemDto[]> {
    return this.repo(manager)
      .find(
        { where: { unitId: unitId }, order: { [orderKey]: direction } });
  }

  async getOneByUuid(uuid: string, manager?: EntityManager): Promise<UnitItemDto> {
    return this.repo(manager).findOneBy({ uuid: uuid });
  }

  async getAllByUnitIdWithMetadata(unitId: number, manager?: EntityManager): Promise<UnitItemWithMetadataDto[]> {
    return Promise.all((await this.getAllByUnitId(unitId, 'id', 'ASC', manager))
      .map(async item => ({
        ...item,
        profiles: await this.unitItemMetadataService.getAllByItemId(item.uuid, manager)
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

  async updateItem(uuid: string, item: UnitItemWithMetadataDto, manager?: EntityManager): Promise<void> {
    const updateItem = await this.getOneByUuid(uuid, manager);
    if (updateItem) {
      const { profiles, ...unitItem } = item;
      await this.repo(manager).update(uuid, unitItem);
      await this.reconcileItemProfiles(uuid, profiles || [], manager);
    }
  }

  // Reconcile item metadata by profileId (the profile form re-emits without the
  // row id), so an edit updates the existing row instead of delete + re-insert.
  private async reconcileItemProfiles(
    uuid: string,
    profiles: UnitItemMetadataDto[],
    manager?: EntityManager
  ): Promise<void> {
    const existingProfiles = await this.unitItemMetadataService.getAllByItemId(uuid, manager);
    await reconcileProfilesByProfileId(existingProfiles, profiles, {
      remove: id => this.unitItemMetadataService.removeItemMetadata(id, manager),
      update: (id, metadata) => this.unitItemMetadataService.updateItemMetadata(id, metadata, manager),
      add: metadata => this.unitItemMetadataService.addItemMetadata(uuid, metadata, manager)
    });
  }

  async patchItemMetadataCurrentProfile(unitId: number, itemProfile: string): Promise<void> {
    const itemsToUpdate: UnitItemWithMetadataDto[] = await this.getAllByUnitIdWithMetadata(unitId);
    const profiles = itemsToUpdate.flatMap(metadata => metadata.profiles);
    await Promise.all(profiles.map(metadata => {
      metadata.isCurrent = profileIdsMatch(metadata.profileId, itemProfile);
      return this.unitItemMetadataService.updateItemMetadata(metadata.id, metadata);
    }));
  }

  async addItem(unitId: number, item: UnitItemWithMetadataDto, manager?: EntityManager): Promise<string> {
    item.unitId = unitId;
    const { uuid, ...itemWithoutUuid } = item;
    const newItem = this.repo(manager).create(itemWithoutUuid);
    await this.repo(manager).save(newItem);
    if (item.profiles) {
      await Promise.all(item.profiles
        .map(profile => this.unitItemMetadataService
          .addItemMetadata(newItem.uuid, profile, manager)));
    }
    return newItem.uuid;
  }

  async removeItem(uuid: string, manager?: EntityManager): Promise<void> {
    await this.repo(manager).delete(uuid);
  }

  async findItemCommentsByUnitId(unitId: number): Promise<UnitCommentUnitItem[]> {
    return this.itemCommentService.findItemCommentsByUnitId(unitId);
  }
}
