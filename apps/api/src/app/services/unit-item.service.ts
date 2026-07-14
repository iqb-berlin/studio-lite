import { Logger } from '@nestjs/common';
import {
  MetadataDto, UnitItemDto, UnitItemInViewDto, UnitItemMetadataDto, UnitItemWithMetadataDto
} from '@studio-lite-lib/api-dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { profileIdsMatch } from '@studio-lite/shared-code';
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

  // Reconcile an incoming profile with its stored row: the client cannot supply a
  // stable row id (the profile form re-emits without it), so identity, creation
  // time and the current-profile flag are carried over from the stored row and
  // only the entries/values come from the incoming payload.
  static mergeMetadata<T extends MetadataDto>(existing: T, incoming: T): T {
    return {
      ...existing,
      ...incoming,
      id: existing.id,
      createdAt: existing.createdAt,
      isCurrent: incoming.isCurrent ?? existing.isCurrent
    };
  }

  async updateItem(uuid: string, item: UnitItemWithMetadataDto): Promise<void> {
    const updateItem = await this.getOneByUuid(uuid);
    if (updateItem) {
      const { profiles, ...unitItem } = item;
      await this.unitItemRepository.update(uuid, unitItem);
      await this.reconcileItemProfiles(uuid, profiles || []);
    }
  }

  // Match incoming profiles to stored rows by profileId (not by the missing row
  // id), so an edit updates the existing row instead of deleting and re-inserting
  // it — which previously dropped created_at/is_current and violated NOT NULL.
  private async reconcileItemProfiles(uuid: string, profiles: UnitItemMetadataDto[]): Promise<void> {
    const existingProfiles = await this.unitItemMetadataService.getAllByItemId(uuid);
    const incomingProfileIds = new Set(profiles.map(profile => profile.profileId));
    const removed = existingProfiles.filter(existing => !incomingProfileIds.has(existing.profileId));
    await Promise.all(removed
      .map(profile => this.unitItemMetadataService.removeItemMetadata(profile.id)));
    await Promise.all(profiles.map(profile => {
      const existing = existingProfiles.find(candidate => candidate.profileId === profile.profileId);
      return existing ?
        this.unitItemMetadataService.updateItemMetadata(existing.id, UnitItemService.mergeMetadata(existing, profile)) :
        this.unitItemMetadataService.addItemMetadata(uuid, profile);
    }));
  }

  async patchItemMetadataCurrentProfile(unitId: number, itemProfile: string): Promise<void> {
    const itemsToUpdate: UnitItemWithMetadataDto[] = await this.getAllByUnitIdWithMetadata(unitId);
    const profiles = itemsToUpdate.flatMap(metadata => metadata.profiles);
    await Promise.all(profiles.map(metadata => {
      metadata.isCurrent = profileIdsMatch(metadata.profileId, itemProfile);
      return this.unitItemMetadataService.updateItemMetadata(metadata.id, metadata);
    }));
  }

  async addItem(unitId: number, item: UnitItemWithMetadataDto): Promise<string> {
    item.unitId = unitId;
    const { uuid, ...itemWithoutUuid } = item;
    const newItem = this.unitItemRepository.create(itemWithoutUuid);
    await this.unitItemRepository.save(newItem);
    if (item.profiles) {
      await Promise.all(item.profiles
        .map(profile => this.unitItemMetadataService
          .addItemMetadata(newItem.uuid, profile)));
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
