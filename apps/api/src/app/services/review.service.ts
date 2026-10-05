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
import Unit from '../entities/unit.entity';
import { UnitService } from './unit.service';
import { ReviewUnprocessableException } from '../exceptions/review-unprocessable.exception';

/**
 * The reviews of a workspace: what they contain, who may open them, and what a reviewer is served.
 *
 * A review is reached by a link -- a generated uuid -- and a password, which is how someone without
 * a studio account gets in. That is also why the read paths here resolve the review's workspace
 * first: a reviewer names a unit id, and only the review says which workspace it may come from.
 *
 * The same holds for managing reviews under `workspaces/:workspace_id/reviews`: the guards check
 * the level in the workspace of the path, so creating, reading, changing and deleting are held to
 * that workspace here, and so are the units a review is given. Before, the workspace came from the
 * body and the review from its id alone, so a maintainer of one workspace reached every other
 * one (#1717).
 */
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
    @InjectRepository(Unit)
    private unitRepository: Repository<Unit>,
    private unitService: UnitService
  ) {}

  /** The review, if it belongs to the workspace; one of another workspace counts as missing. */
  private async findInWorkspace(reviewId: number, workspaceId: number): Promise<Review> {
    const review = await this.reviewRepository.findOne({ where: { id: reviewId, workspaceId } });
    if (!review) throw new NotFoundException();
    return review;
  }

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

  /** Creates the review in the workspace of the path; a `workspaceId` in the body is ignored. */
  async create(workspaceId: number, createReview: CreateReviewDto): Promise<number> {
    if (!createReview.name) {
      throw new ReviewUnprocessableException(0, 'POST');
    }
    const timeStamp = new Date();
    const newReview = this.reviewRepository.create({
      ...createReview,
      workspaceId,
      link: uuIdv4(),
      createdAt: timeStamp,
      changedAt: timeStamp
    });
    await this.reviewRepository.save(newReview);
    return newReview.id;
  }

  /**
   * The review with its units. With `workspaceId` -- the management routes -- only a review of that
   * workspace is found. Without it, the review route for a reviewer, which `ReviewGuard` has already
   * tied to the review of the token.
   */
  async findOne(reviewId: number, workspaceId?: number): Promise<ReviewFullDto> {
    this.logger.log(`Returning data for review with id: ${reviewId}`);
    const review = workspaceId === undefined ?
      await this.reviewRepository.findOne({ where: { id: reviewId } }) :
      await this.findInWorkspace(reviewId, workspaceId);
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
      // The same units isUnitInReview lets through: a unit moved to another workspace since would
      // stand in the review's navigation and fail as soon as it is opened. Its entry stays until the
      // review is saved again -- a unit handed back from a drop box before that is part of it again,
      // but saving writes what the dialog shows, and it no longer shows this unit.
      units: await this.unitsOfWorkspace(units.map(u => u.unitId), review.workspaceId)
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

  async patch(workspaceId: number, reviewId: number, newData: ReviewFullDto): Promise<void> {
    this.logger.log(`Patching data for review with id: ${reviewId}`);
    if (!newData.name) {
      throw new ReviewUnprocessableException(newData.id, 'PATCH');
    }
    const timeStamp = new Date();
    const reviewToUpdate = await this.findInWorkspace(reviewId, workspaceId);
    const propsToUpdate = ['name', 'password', 'settings'];
    propsToUpdate.forEach(prop => {
      if (Object.prototype.hasOwnProperty.call(newData, prop)) {
        reviewToUpdate[prop] = newData[prop];
      }
    });
    await this.reviewRepository.save({ ...reviewToUpdate, changedAt: timeStamp });
    if (Object.prototype.hasOwnProperty.call(newData, 'units')) {
      // Only units of the review's workspace are kept (#1717). One of another workspace would be
      // served to everyone with the review's link; and a unit moved away since -- submitting it
      // to a drop box does that too -- stays in the saved list the dialog sends back, so refusing
      // the save would leave the review unsavable for a unit nobody can see in it any more.
      const unitIds = await this.unitsOfWorkspace(newData.units, workspaceId);
      const leftOut = [...new Set(newData.units.map(Number))].filter(id => !unitIds.includes(id));
      if (leftOut.length) {
        this.logger.warn(`Review units not in workspace ${workspaceId} left out: ${leftOut.join(', ')}`);
      }
      await this.reviewUnitRepository.delete({ reviewId: reviewId });
      this.logger.log(`Set units for review with id: ${reviewId}`);
      const newReviewUnits = unitIds.map((unitId, index) => this.reviewUnitRepository.create({
        reviewId: reviewId,
        unitId: unitId,
        order: index
      }));
      // Await the inserts: responding before they are written lets clients
      // re-read the review without its new units, and insert errors would
      // otherwise be swallowed after a 200.
      await this.reviewUnitRepository.save(newReviewUnits);
    }
  }

  async remove(workspaceId: number, id: number): Promise<void> {
    await this.findInWorkspace(id, workspaceId);
    await this.reviewRepository.delete(id);
  }

  /** The given units that belong to the workspace, in their order and each once. */
  private async unitsOfWorkspace(unitIds: number[], workspaceId: number): Promise<number[]> {
    const distinctIds = [...new Set(unitIds.map(Number))];
    if (!distinctIds.length) return [];
    const units = await this.unitRepository.find({
      where: { id: In(distinctIds), workspaceId },
      select: { id: true }
    });
    const inWorkspace = new Set(units.map(unit => unit.id));
    return distinctIds.filter(id => inWorkspace.has(id));
  }

  /**
   * Whether this unit is part of this review. What the review routes are narrowed by: they are
   * addressed with a unit id from the path, and only the review says which units that may be.
   */
  async isUnitInReview(reviewId: number, unitId: number): Promise<boolean> {
    const reviewUnit = await this.reviewUnitRepository.findOne({
      where: { reviewId: reviewId, unitId: unitId },
      select: { unitId: true }
    });
    if (!reviewUnit) return false;
    // The unit has to be in the review's workspace as well. The review routes load a unit by its
    // id, and a unit moved out of the workspace since keeps its place in the review (#1717).
    const review = await this.reviewRepository.findOne({ where: { id: reviewId }, select: { workspaceId: true } });
    if (!review) return false;
    return this.unitRepository.exists({ where: { id: unitId, workspaceId: review.workspaceId } });
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
