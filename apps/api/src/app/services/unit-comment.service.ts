import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  UnitCommentDto, CreateUnitCommentDto, UpdateUnitCommentDto
} from '@studio-lite-lib/api-dto';
import UnitComment from '../entities/unit-comment.entity';
import { UnitCommentNotFoundException } from '../exceptions/unit-comment-not-found.exception';
import { ItemCommentService } from './item-comment.service';
import { ItemUuidLookup } from '../interfaces/item-uuid-lookup.interface';

@Injectable()
export class UnitCommentService {
  private readonly logger = new Logger(UnitCommentService.name);

  constructor(
    @InjectRepository(UnitComment)
    private unitCommentsRepository: Repository<UnitComment>,
    private itemCommentService: ItemCommentService
  ) {}

  async findOnesComments(unitId: number): Promise<UnitCommentDto[]> {
    this.logger.log(`Returning comments for unit with id: ${unitId}`);
    const comments = await this.unitCommentsRepository
      .find({
        where: { unitId: unitId },
        order: { createdAt: 'ASC' }
      });
    return Promise.all(comments.map(async comment => ({
      ...comment,
      itemUuids: (await this.itemCommentService.findUnitItemComments(unitId, comment.id))
        .map(i => i.unitItemUuid)
    })));
  }

  async copyComments(oldUnitId: number, newUnitId: number, itemUuidLookups: ItemUuidLookup[]): Promise<void> {
    const comments = await this.findOnesComments(oldUnitId);
    await this.createComments(comments, newUnitId, itemUuidLookups);
  }

  private async copyComment(comment: UnitCommentDto,
                            newUnitId: number,
                            comments: UnitCommentDto[],
                            parentId: number | null,
                            itemUuidLookups: ItemUuidLookup[]): Promise<number> {
    const newComment = this.unitCommentsRepository
      .create({
        ...comment,
        id: undefined,
        parentId: parentId,
        unitId: newUnitId
      });
    await this.unitCommentsRepository.save(newComment);
    if (comment.itemUuids && comment.itemUuids.length) {
      await this.createCommentConnections(newComment.id, newUnitId, comment.itemUuids, itemUuidLookups);
    }
    if (parentId === null) {
      const childComments = comments.filter(c => c.parentId === comment.id);
      await Promise.all(childComments.map(async child => {
        await this.copyComment(child, newUnitId, comments, newComment.id, itemUuidLookups);
      }));
    }
    return newComment.id;
  }

  async createCommentConnections(commentId: number,
                                 unitId: number,
                                 commentItemUuids: string[],
                                 itemUuidLookup: ItemUuidLookup[]): Promise<number[]> {
    const newItemUuids = commentItemUuids
      .map(itemUuid => itemUuidLookup
        .find(lookup => lookup.oldUuid === itemUuid).newUuid);
    return Promise.all(
      newItemUuids
        .map(itemUuid => this.itemCommentService
          .createCommentItemConnection(unitId, itemUuid, commentId)));
  }

  async findOnesLastChangedComment(unitId: number): Promise<UnitCommentDto | null> {
    const comments = await this.unitCommentsRepository
      .find({
        where: { unitId: unitId },
        order: { changedAt: 'DESC' }
      });
    if (comments && comments.length) {
      return comments[0];
    }
    return null;
  }

  async createComment(unitComment: CreateUnitCommentDto): Promise<number> {
    this.logger.log(`Creating a comment for unit with id: ${unitComment.unitId}`);
    const timeStamp = new Date();
    const newComment = this.unitCommentsRepository
      .create({ ...unitComment, createdAt: timeStamp, changedAt: timeStamp });
    await this.unitCommentsRepository.save(newComment);
    return newComment.id;
  }

  async createComments(comments: UnitCommentDto[], unitId: number, itemUuids: ItemUuidLookup[]): Promise<void> {
    const parentComments = comments.filter(c => !c.parentId);
    await Promise.all(parentComments.map(async comment => {
      await this.copyComment(comment, unitId, comments, comment.parentId, itemUuids);
    }));
  }

  async removeComment(id: number): Promise<void> {
    this.logger.log(`Deleting comment with id: ${id}`);
    const allChildren = await this.unitCommentsRepository.find({
      where: { parentId: id },
      select: { id: true }
    });
    await this.unitCommentsRepository.delete([id, ...allChildren.map(ch => ch.id)]);
  }

  async findOneComment(id: number): Promise<UnitCommentDto> {
    this.logger.log(`Accessing comment with id: ${id}`);
    const comment = await this.unitCommentsRepository.findOne({ where: { id: id } });
    if (comment) {
      return comment;
    }
    throw new UnitCommentNotFoundException(id, 'DELETE');
  }

  async patchCommentBody(id: number, comment: UpdateUnitCommentDto): Promise<void> {
    this.logger.log(`Updating comment with id: ${id}`);
    const commentToUpdate = await this.unitCommentsRepository.findOne({ where: { id: id } });
    if (commentToUpdate) {
      commentToUpdate.body = comment.body;
      commentToUpdate.changedAt = new Date();
      await this.unitCommentsRepository.save(commentToUpdate);
    } else {
      throw new UnitCommentNotFoundException(id, 'PATCH');
    }
  }
}
