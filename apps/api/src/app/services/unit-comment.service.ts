import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository, Not, In, FindOptionsWhere
} from 'typeorm';
import {
  UnitCommentDto, CreateUnitCommentDto, UpdateUnitCommentDto, UpdateUnitCommentVisibilityDto,
  UnitCommentVoterDto
} from '@studio-lite-lib/api-dto';
import UnitComment from '../entities/unit-comment.entity';
import UnitCommentVote from '../entities/unit-comment-vote.entity';
import { UnitCommentNotFoundException } from '../exceptions/unit-comment-not-found.exception';
import { ItemCommentService } from './item-comment.service';
import { ItemUuidLookup } from '../interfaces/item-uuid-lookup.interface';

@Injectable()
export class UnitCommentService {
  private readonly logger = new Logger(UnitCommentService.name);

  constructor(
    @InjectRepository(UnitComment)
    private unitCommentsRepository: Repository<UnitComment>,
    @InjectRepository(UnitCommentVote)
    private unitCommentVoteRepository: Repository<UnitCommentVote>,
    private itemCommentService: ItemCommentService
  ) {}

  async findOnesComments(unitId: number, userId?: number): Promise<UnitCommentDto[]> {
    this.logger.log(`Returning comments for unit with id: ${unitId}`);
    const comments = await this.unitCommentsRepository
      .find({
        where: { unitId: unitId },
        order: { createdAt: 'ASC' }
      });

    const votes = await this.unitCommentVoteRepository.find({
      where: comments.length > 0 ? { commentId: In(comments.map(c => c.id)) } : { commentId: -1 }
    });

    return Promise.all(comments.map(async comment => {
      const commentVotes = votes.filter(v => v.commentId === comment.id);
      return {
        ...comment,
        upVotes: commentVotes.filter(v => v.vote === 'up').length,
        downVotes: commentVotes.filter(v => v.vote === 'down').length,
        userVote: userId ? commentVotes.find(v => v.userId === userId)?.vote || null : null,
        itemUuids: (await this.itemCommentService.findUnitItemComments(unitId, comment.id))
          .map(i => i.unitItemUuid)
      };
    }));
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

  async findOnesLastChangedComment(unitId: number, excludeUserId?: number): Promise<UnitCommentDto | null> {
    const whereClause: FindOptionsWhere<UnitComment> = { unitId: unitId };
    if (excludeUserId) {
      whereClause.userId = Not(excludeUserId);
    }
    const comments = await this.unitCommentsRepository
      .find({
        where: whereClause,
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

  async patchCommentVisibility(id: number, comment: UpdateUnitCommentVisibilityDto): Promise<void> {
    this.logger.log(`Updating visibility of comment with id: ${id}`);
    const commentToUpdate = await this.unitCommentsRepository.findOne({ where: { id: id } });
    if (commentToUpdate) {
      commentToUpdate.hidden = comment.hidden;
      await this.unitCommentsRepository.save(commentToUpdate);
    } else {
      throw new UnitCommentNotFoundException(id, 'PATCH');
    }
  }

  async toggleVote(commentId: number, userId: number, vote: 'up' | 'down' | null): Promise<void> {
    this.logger.log(`User ${userId} toggling vote on comment ${commentId} to ${vote}`);
    if (!vote) {
      await this.unitCommentVoteRepository.delete({ commentId, userId });
    } else {
      const existingVote = await this.unitCommentVoteRepository.findOne({ where: { commentId, userId } });
      if (existingVote) {
        existingVote.vote = vote;
        await this.unitCommentVoteRepository.save(existingVote);
      } else {
        const newVote = this.unitCommentVoteRepository.create({ commentId, userId, vote });
        await this.unitCommentVoteRepository.save(newVote);
      }
    }
  }

  async getCommentVoters(commentId: number): Promise<UnitCommentVoterDto[]> {
    const votesWithUsers = await this.unitCommentVoteRepository.find({
      where: { commentId },
      relations: ['user'],
      order: {
        user: {
          lastName: 'ASC',
          firstName: 'ASC'
        }
      }
    });

    return votesWithUsers.map(v => {
      const lastName = v.user.lastName ? v.user.lastName.trim() : '';
      const firstName = v.user.firstName ? v.user.firstName.trim() : '';
      const name = v.user.name ? v.user.name.trim() : '';
      const displayName = lastName || name;
      const userName = firstName ? `${displayName}, ${firstName}` : displayName;
      return { userName, vote: v.vote };
    });
  }
}
