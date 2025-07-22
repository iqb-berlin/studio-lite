import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import UnitCommentUnitItem from '../entities/unit-comment-unit-item.entity';
import UnitComment from '../entities/unit-comment.entity';
import UnitItem from '../entities/unit-item.entity';
import { UnitCommentNotFoundException } from '../exceptions/unit-comment-not-found.exception';
import { UnitItemNotFoundException } from '../exceptions/unit-item-not-found.exception';

@Injectable()
export class ItemCommentService {
  private readonly logger = new Logger(ItemCommentService.name);

  constructor(
    @InjectRepository(UnitCommentUnitItem)
    private unitCommentUnitItemRepository: Repository<UnitCommentUnitItem>,
    @InjectRepository(UnitComment)
    private unitCommentsRepository: Repository<UnitComment>,
    @InjectRepository(UnitItem)
    private unitItemRepository: Repository<UnitItem>
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

    const comment = await this.unitCommentsRepository.findOne({
      where: { id: commentId }
    });
    if (!comment) {
      this.logger.warn(`Comment with id ${commentId} not found`);
      throw new UnitCommentNotFoundException(commentId, 'createCommentItemConnection');
    }

    // Check if the item exists
    const item = await this.unitItemRepository.findOne({
      where: { uuid: itemUuid }
    });
    if (!item) {
      this.logger.warn(`Unit item with uuid ${itemUuid} not found`);
      throw new UnitItemNotFoundException(itemUuid, 'createCommentItemConnection');
    }

    // Check if connection already exists
    const existingConnection = await this.unitCommentUnitItemRepository.findOne({
      where: {
        unitCommentId: commentId,
        unitItemUuid: itemUuid
      }
    });

    if (existingConnection) {
      this.logger.log(`Connection already exists for item ${itemUuid} and comment ${commentId}`);
      return commentId;
    }

    const timeStamp = new Date();
    const unitCommentUnitItem = this.unitCommentUnitItemRepository
      .create({
        unitCommentId: commentId,
        unitItemUuid: itemUuid,
        unitId: unitId,
        createdAt: timeStamp,
        changedAt: timeStamp
      });

    await this.unitCommentUnitItemRepository.save(unitCommentUnitItem);
    this.logger.log(`Successfully created connection for item ${itemUuid} and comment ${commentId}`);
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
    try {
      const commentItems = await this.findCommentItems(commentId);
      const { removed, added } = ItemCommentService.compare(commentItems, unitItemUuids);

      // Handle removals
      await Promise.all(removed.map(async unitItemUuid => {
        try {
          await this.removeCommentItemConnection(unitItemUuid, commentId);
        } catch (error) {
          this.logger.error(`Failed to remove connection for item ${unitItemUuid}: ${error.message}`);
          // Don't throw here, continue with other operations
        }
      }));

      // Handle additions
      await Promise.all(added.map(async unitItemUuid => {
        try {
          await this.createCommentItemConnection(unitId, unitItemUuid, commentId);
        } catch (error) {
          this.logger.error(`Failed to create connection for item ${unitItemUuid}: ${error.message}`);
          // Don't throw here, continue with other operations
        }
      }));
    } catch (error) {
      this.logger.error(`Error in updateCommentItems: ${error.message}`);
      throw error;
    }
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
