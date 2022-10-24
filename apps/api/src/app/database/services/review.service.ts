import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, MoreThan, Repository } from 'typeorm';
import {
  CreateReviewDto,
  ReviewFullDto,
  ReviewInListDto,
  ReviewDto
} from '@studio-lite-lib/api-dto';
import { v4 as uuIdv4 } from 'uuid';
import Review from '../entities/review.entity';
import ReviewUnit from '../entities/review-unit.entity';
import WorkspaceUser from '../entities/workspace-user.entity';

@Injectable()
export class ReviewService {
  private readonly logger = new Logger(ReviewService.name);

  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(ReviewUnit)
    private reviewUnitRepository: Repository<ReviewUnit>,
    @InjectRepository(WorkspaceUser)
    private workspaceUsersRepository: Repository<WorkspaceUser>
  ) {}

  async findAll(workspaceId: number): Promise<ReviewInListDto[]> {
    this.logger.log(`Retrieving reviews for workspaceId ${workspaceId}`);
    return this.reviewRepository.find({
      where: { workspaceId: workspaceId },
      order: { name: 'ASC' },
      select: {
        id: true,
        name: true,
        link: true
      }
    });
  }

  async create(createReview: CreateReviewDto): Promise<number> {
    const newReview = await this.reviewRepository.create(createReview);
    newReview.link = uuIdv4();
    await this.reviewRepository.save(newReview);
    return newReview.id;
  }

  async findOne(reviewId: number): Promise<ReviewFullDto> {
    this.logger.log(`Returning data for review with id: ${reviewId}`);
    const review = await this.reviewRepository.findOne({ where: { id: reviewId } });
    if (!review) throw new NotFoundException();
    const units = await this.reviewUnitRepository.find({
      where: { reviewId: reviewId },
      order: { order: 'ASC' }
    });
    return {
      id: review.id,
      name: review.name,
      link: review.link,
      password: review.password,
      settings: review.settings,
      units: units.map(u => u.unitId)
    };
  }

  async findOneForAuth(reviewId: number): Promise<ReviewDto> {
    this.logger.log(`Returning data for review for auth: ${reviewId}`);
    const review = await this.reviewRepository.findOne({ where: { id: reviewId } });
    return {
      id: review.id,
      name: review.name,
      workspaceId: review.workspaceId
    };
  }

  async findAllByUser(userId: number): Promise<ReviewDto[]> {
    this.logger.log(`Retrieving reviews by userId ${userId}`);
    const workspaces = await this.workspaceUsersRepository.find({
      where: { userId: userId }
    });
    const workspacesIdList = workspaces.map(ws => ws.workspaceId);
    const reviews = await this.reviewRepository.find({
      where: {
        workspaceId: In(workspacesIdList),
        units: MoreThan(0)
      },
      order: { name: 'ASC' },
      select: {
        id: true,
        name: true,
        workspaceId: true
      }
    });
    return reviews.map(r => <ReviewDto>{
      id: r.id,
      name: r.name,
      workspaceId: r.workspaceId
    });
  }

  async patch(reviewId: number, newData: ReviewFullDto): Promise<void> {
    this.logger.log(`Patching data for review with id: ${reviewId}`);
    const reviewToUpdate = await this.reviewRepository.findOne({ where: { id: reviewId } });
    let changed = false;
    // eslint-disable-next-line no-prototype-builtins
    if (newData.hasOwnProperty('name')) {
      reviewToUpdate.name = newData.name;
      changed = true;
    }
    // eslint-disable-next-line no-prototype-builtins
    if (newData.hasOwnProperty('password')) {
      reviewToUpdate.password = newData.password;
      changed = true;
    }
    // eslint-disable-next-line no-prototype-builtins
    if (newData.hasOwnProperty('settings')) {
      reviewToUpdate.settings = newData.settings;
      changed = true;
    }
    if (changed) await this.reviewRepository.save(reviewToUpdate);
    // eslint-disable-next-line no-prototype-builtins
    if (newData.hasOwnProperty('units')) {
      await this.reviewUnitRepository.delete({ reviewId: reviewId });
      this.logger.log(`Set units for review with id: ${reviewId}`);
      newData.units.forEach(unitId => {
        const newReviewUnit = this.reviewUnitRepository.create(<ReviewUnit>{
          reviewId: reviewId,
          unitId: unitId,
          order: newData.units.indexOf(unitId)
        });
        this.reviewUnitRepository.save(newReviewUnit);
      });
    }
  }

  async remove(id: number | number[]): Promise<void> {
    await this.reviewRepository.delete(id);
  }

  async getReviewByKeyAndPassword(name: string, password: string): Promise<number | null> {
    const review = await this.reviewRepository.findOne({
      where: { link: name, password: password },
      select: { id: true }
    });
    if (review) return review.id;
    return null;
  }
}
