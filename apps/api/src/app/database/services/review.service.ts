import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateReviewDto,
  ReviewFullDto,
  ReviewInListDto
} from '@studio-lite-lib/api-dto';
import { v4 as uuIdv4 } from 'uuid';
import Review from '../entities/review.entity';
import ReviewUnit from '../entities/review-unit.entity';

@Injectable()
export class ReviewService {
  private readonly logger = new Logger(ReviewService.name);

  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(ReviewUnit)
    private reviewUnitRepository: Repository<ReviewUnit>
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
    const units = await this.reviewUnitRepository.find({
      where: { reviewId: reviewId },
      order: { order: 'ASC' }
    });
    return {
      id: review.id,
      name: review.name,
      link: review.link,
      password: review.password,
      units: units.map(u => u.unitId)
    };
  }

  async patch(reviewId: number, newData: ReviewFullDto): Promise<void> {
    this.logger.log(`Patching data for review with id: ${reviewId}`);
    const reviewToUpdate = await this.reviewRepository.findOne({ where: { id: reviewId } });
    let changed = false;
    if (newData.hasOwnProperty('name')) {
      reviewToUpdate.name = newData.name;
      changed = true;
    }
    if (newData.hasOwnProperty('password')) {
      reviewToUpdate.password = newData.password;
      changed = true;
    }
    if (newData.hasOwnProperty('settings')) {
      reviewToUpdate.settings = newData.settings;
      changed = true;
    }
    if (changed) await this.reviewRepository.save(reviewToUpdate);
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
}
