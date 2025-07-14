import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import UnitCommentUnitItem from '../entities/unit-comment-unit-item.entity';

@Injectable()
export class ItemCommentService {
  private readonly logger = new Logger(ItemCommentService.name);

  constructor(
    @InjectRepository(UnitCommentUnitItem)
    private unitCommentUnitItemRepository: Repository<UnitCommentUnitItem>
  ) {}

  async findItemComments(itemUuid: string): Promise<UnitCommentUnitItem[]> {
    this.logger.log(`Returning comments for item with uuid: ${itemUuid}`);
    return this.unitCommentUnitItemRepository
      .find({
        where: { unitItemUuid: itemUuid },
        order: { createdAt: 'ASC' }
      });
  }

  async findCommentItems(commentId: number): Promise<UnitCommentUnitItem[]> {
    this.logger.log(`Returning items for comment with id: ${commentId}`);
    return this.unitCommentUnitItemRepository
      .find({
        where: { unitCommentId: commentId },
        order: { createdAt: 'ASC' }
      });
  }

  async createCommentItemConnection(unitId: number, itemUuid: string, commentId: number): Promise<number> {
    this.logger.log(`Creating a comment connection for item with uuid ${itemUuid}`);
    const timeStamp = new Date();
    const newComment = this.unitCommentUnitItemRepository
      .create(
        {
          unitCommentId: commentId,
          unitItemUuid: itemUuid,
          unitId: unitId,
          createdAt: timeStamp,
          changedAt: timeStamp
        });
    await this.unitCommentUnitItemRepository.save(newComment);
    return commentId;
  }

  async removeCommentItemConnection(itemUuid: string, commentId: number): Promise<void> {
    this.logger.log(`Deleting comment connection for item with uuid: ${itemUuid}`);
    await this.unitCommentUnitItemRepository.delete({
      unitCommentId: commentId,
      unitItemUuid: itemUuid
    });
  }

  findItemCommentsByUnitId(unitId: number): Promise<UnitCommentUnitItem[]> {
    this.logger.log(`Returning item comments for unit with uuid: ${unitId}`);
    return this.unitCommentUnitItemRepository
      .find({
        where: { unitId: unitId },
        order: { createdAt: 'ASC' }
      });
  }

  findUnitItemComments(unitId: number, commentId: number): Promise<UnitCommentUnitItem[]> {
    this.logger.log(`Returning item comments for unit with uuid: ${unitId}`);
    return this.unitCommentUnitItemRepository
      .find({
        where: { unitId: unitId, unitCommentId: commentId },
        order: { createdAt: 'ASC' },
        select: ['unitItemUuid']
      });
  }

  async updateCommentItems(unitId: number, commentId: number, unitItemUuids: string[]) {
    const commentItems = await this.findCommentItems(commentId);
    const { removed, added } = ItemCommentService.compare(commentItems, unitItemUuids);
    removed
      .map(unitItemUuid => this.removeCommentItemConnection(unitItemUuid, commentId));
    added
      .map(unitItemUuid => this.createCommentItemConnection(unitId, unitItemUuid, commentId));
  }

  static compare(
    savedItems: UnitCommentUnitItem[],
    newUuids: string[]
  ): { unchanged: string[]; removed: string[]; added: string[]; } {
    const savedUuids = savedItems.map(i => i.unitItemUuid);
    const unchanged = savedUuids
      .filter(uuid => newUuids.includes(uuid));
    const removed = savedUuids
      .filter(uuid => !newUuids.includes(uuid));
    const added = newUuids
      .filter(uuid => !savedUuids.includes(uuid));
    return { unchanged, removed, added };
  }
}
