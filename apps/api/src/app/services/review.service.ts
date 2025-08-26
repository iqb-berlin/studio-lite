import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, MoreThan, Repository } from 'typeorm';
import {
  CreateReviewDto,
  ReviewFullDto,
  ReviewInListDto,
  ReviewDto, UnitPropertiesDto
} from '@studio-lite-lib/api-dto';
import { v4 as uuIdv4 } from 'uuid';
import Review from '../entities/review.entity';
import ReviewUnit from '../entities/review-unit.entity';
import WorkspaceUser from '../entities/workspace-user.entity';
import Workspace from '../entities/workspace.entity';
import { UnitService } from './unit.service';

@Injectable()
export class ReviewService {
  private readonly logger = new Logger(ReviewService.name);

  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(ReviewUnit)
    private reviewUnitRepository: Repository<ReviewUnit>,
    @InjectRepository(WorkspaceUser)
    private workspaceUsersRepository: Repository<WorkspaceUser>,
    @InjectRepository(Workspace)
    private workspaceRepository: Repository<Workspace>,
    private unitService: UnitService
  ) {}

  async findAll(workspaceId: number): Promise<ReviewInListDto[]> {
    this.logger.log(`Retrieving reviews for workspaceId ${workspaceId}`);
    return this.reviewRepository.find({
      where: { workspaceId: workspaceId },
      order: { name: 'ASC' },
      select: {
        id: true,
        name: true,
        link: true,
        changedAt: true,
        createdAt: true
      }
    });
  }

  async create(createReview: CreateReviewDto): Promise<number> {
    const timeStamp = new Date();
    const newReview = this.reviewRepository.create({
      ...createReview,
      link: uuIdv4(),
      createdAt: timeStamp,
      changedAt: timeStamp
    });
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
    const workspaceData = await this.workspaceRepository.findOne({
      where: {
        id: review.workspaceId
      },
      relations: [
        'workspaceGroup'
      ]
    });
    return {
      ...review,
      workspaceName: workspaceData.name,
      workspaceGroupId: workspaceData.workspaceGroup.id,
      workspaceGroupName: workspaceData.workspaceGroup.name,
      units: units.map(u => u.unitId)
    };
  }

  async findUnitProperties(unitId: number, reviewId: number): Promise<UnitPropertiesDto> {
    const review = await this.reviewRepository
      .findOne({ where: { id: reviewId }, select: ['workspaceId'] });
    return this.unitService.findOnesProperties(unitId, review.workspaceId);
  }

  async findOneForAuth(reviewId: number): Promise<ReviewDto> {
    this.logger.log(`Returning data for review for auth: ${reviewId}`);
    const review = await this.reviewRepository.findOne({ where: { id: reviewId } });
    return {
      id: review.id,
      name: review.name,
      workspaceId: review.workspaceId,
      changedAt: review.changedAt,
      createdAt: review.createdAt
    };
  }

  async findAllByUser(userId: number): Promise<ReviewDto[]> {
    this.logger.log(`Retrieving reviews by userId ${userId}`);
    const workspaces = await this.workspaceUsersRepository.find({
      where: { userId: userId }
    });
    const workspacesIdList = workspaces.map(ws => ws.workspaceId);
    const workspaceList = await this.workspaceRepository.find({
      where: {
        id: In(workspacesIdList)
      },
      relations: [
        'workspaceGroup'
      ]
    });
    const workspaceInfo: { [key: string]: {
      name: string;
      groupId: number;
      groupName: string;
    } } = {};
    workspaceList.forEach(ws => {
      workspaceInfo[ws.id] = {
        name: ws.name,
        groupId: ws.workspaceGroup.id,
        groupName: ws.workspaceGroup.name
      };
    });
    const reviews = await this.reviewRepository.find({
      where: {
        workspaceId: In(workspacesIdList),
        units: MoreThan(0)
      },
      order: { name: 'ASC' },
      select: {
        id: true,
        name: true,
        workspaceId: true,
        changedAt: true,
        createdAt: true
      }
    });
    return reviews.map(r => <ReviewDto>{
      ...r,
      workspaceName: workspaceInfo[r.workspaceId].name,
      workspaceGroupId: workspaceInfo[r.workspaceId].groupId,
      workspaceGroupName: workspaceInfo[r.workspaceId].groupName
    });
  }

  async patch(reviewId: number, newData: ReviewFullDto): Promise<void> {
    this.logger.log(`Patching data for review with id: ${reviewId}`);
    const timeStamp = new Date();
    const reviewToUpdate = await this.reviewRepository.findOne({ where: { id: reviewId } });
    const propsToUpdate = ['name', 'password', 'settings'];
    propsToUpdate.forEach(prop => {
      if (Object.prototype.hasOwnProperty.call(newData, prop)) {
        reviewToUpdate[prop] = newData[prop];
      }
    });
    await this.reviewRepository.save({ ...reviewToUpdate, changedAt: timeStamp });
    if (Object.prototype.hasOwnProperty.call(newData, 'units')) {
      await this.reviewUnitRepository.delete({ reviewId: reviewId });
      this.logger.log(`Set units for review with id: ${reviewId}`);
      newData.units.forEach(unitId => {
        const newReviewUnit = this.reviewUnitRepository.create({
          reviewId: reviewId,
          unitId: unitId,
          order: newData.units.indexOf(unitId)
        });
        this.reviewUnitRepository.save(newReviewUnit);
      });
    }
  }

  async remove(id: number): Promise<void> {
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
