import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  UnitCommentDto, CreateUnitCommentDto, UpdateUnitCommentDto
} from '@studio-lite-lib/api-dto';
import UnitComment from '../entities/unit-comment.entity';
import { UnitCommentNotFoundException } from '../../exceptions/unit-comment-not-found.exception';

@Injectable()
export class UnitCommentService {
  private readonly logger = new Logger(UnitCommentService.name);

  constructor(
    @InjectRepository(UnitComment)
    private unitCommentsRepository: Repository<UnitComment>
  ) {}

  async findOnesComments(unitId: number): Promise<UnitCommentDto[]> {
    this.logger.log(`Returning comments for unit with id: ${unitId}`);
    return this.unitCommentsRepository
      .find({
        where: { unitId: unitId },
        order: { createdAt: 'ASC' }
      });
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
