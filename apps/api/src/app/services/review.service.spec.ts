import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { NotFoundException } from '@nestjs/common';
import {
  CreateReviewDto,
  ReviewFullDto,
  UnitPropertiesDto
} from '@studio-lite-lib/api-dto';
import { ReviewService } from './review.service';
import Review from '../entities/review.entity';
import ReviewUnit from '../entities/review-unit.entity';
import WorkspaceUser from '../entities/workspace-user.entity';
import Workspace from '../entities/workspace.entity';
import Unit from '../entities/unit.entity';
import { UnitService } from './unit.service';
import { ReviewUnprocessableException } from '../exceptions/review-unprocessable.exception';

describe('ReviewService', () => {
  let service: ReviewService;
  let reviewRepository: DeepMocked<Repository<Review>>;
  let reviewUnitRepository: DeepMocked<Repository<ReviewUnit>>;
  let workspaceUsersRepository: DeepMocked<Repository<WorkspaceUser>>;
  let workspaceRepository: DeepMocked<Repository<Workspace>>;
  let unitRepository: DeepMocked<Repository<Unit>>;
  let unitService: DeepMocked<UnitService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewService,
        {
          provide: getRepositoryToken(Review),
          useValue: createMock<Repository<Review>>()
        },
        {
          provide: getRepositoryToken(ReviewUnit),
          useValue: createMock<Repository<ReviewUnit>>()
        },
        {
          provide: getRepositoryToken(WorkspaceUser),
          useValue: createMock<Repository<WorkspaceUser>>()
        },
        {
          provide: getRepositoryToken(Workspace),
          useValue: createMock<Repository<Workspace>>()
        },
        {
          provide: getRepositoryToken(Unit),
          useValue: createMock<Repository<Unit>>()
        },
        {
          provide: UnitService,
          useValue: createMock<UnitService>()
        }
      ]
    }).compile();

    service = module.get<ReviewService>(ReviewService);
    reviewRepository = module.get(getRepositoryToken(Review));
    reviewUnitRepository = module.get(getRepositoryToken(ReviewUnit));
    workspaceUsersRepository = module.get(getRepositoryToken(WorkspaceUser));
    workspaceRepository = module.get(getRepositoryToken(Workspace));
    unitRepository = module.get(getRepositoryToken(Unit));
    unitService = module.get(UnitService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return reviews for workspace', async () => {
      const reviews = [new Review()];
      reviewRepository.find.mockResolvedValue(reviews);
      expect(await service.findAll(1)).toBe(reviews);
    });
  });

  describe('create', () => {
    it('should throw if name is missing', async () => {
      await expect(service.create(1, {} as CreateReviewDto)).rejects.toThrow(ReviewUnprocessableException);
    });

    it('should create review', async () => {
      const createDto = { name: 'test', workspaceId: 1 };
      reviewRepository.create.mockReturnValue({ id: 1 } as Review);
      reviewRepository.save.mockResolvedValue({ id: 1 } as Review);

      const result = await service.create(1, createDto);
      expect(result).toBe(1);
    });

    // The guards checked the level in the workspace of the path; a workspace named in the body
    // put the review into any other one (#1717).
    it('should create the review in the workspace of the path, not the one in the body', async () => {
      reviewRepository.create.mockImplementation(entity => entity as Review);

      await service.create(3, { name: 'test', workspaceId: 9 });

      expect(reviewRepository.create).toHaveBeenCalledWith(expect.objectContaining({ workspaceId: 3 }));
    });
  });

  describe('findOne', () => {
    it('should throw if not found', async () => {
      reviewRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });

    it('should look the review up within the workspace when one is given', async () => {
      reviewRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(1, 3)).rejects.toThrow(NotFoundException);
      expect(reviewRepository.findOne).toHaveBeenCalledWith({ where: { id: 1, workspaceId: 3 } });
    });

    // The route of a reviewer names no workspace; ReviewGuard has tied it to the token's review.
    it('should look the review up by its id alone without a workspace', async () => {
      reviewRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
      expect(reviewRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should return review details', async () => {
      const review = { id: 1, workspaceId: 1 } as Review;
      reviewRepository.findOne.mockResolvedValue(review);

      reviewUnitRepository.find.mockResolvedValue([{ unitId: 10 }] as ReviewUnit[]);
      unitRepository.find.mockResolvedValue([{ id: 10 }] as Unit[]);

      const workspace = {
        id: 1,
        name: 'ws',
        workspaceGroup: { id: 2, name: 'wg' }
      } as Workspace;
      workspaceRepository.findOne.mockResolvedValue(workspace);

      const result = await service.findOne(1);
      expect(result.id).toBe(1);
      expect(result.workspaceName).toBe('ws');
      expect(result.units).toEqual([10]);
    });

    // isUnitInReview refuses a unit that has left the review's workspace; listing it anyway put
    // it into the review's navigation, where opening it failed.
    it('should list only the units that are still in the review\'s workspace, in their order', async () => {
      reviewRepository.findOne.mockResolvedValue({ id: 1, workspaceId: 1 } as Review);
      reviewUnitRepository.find.mockResolvedValue([{ unitId: 12 }, { unitId: 10 }, { unitId: 11 }] as ReviewUnit[]);
      unitRepository.find.mockResolvedValue([{ id: 10 }, { id: 12 }] as Unit[]);
      workspaceRepository.findOne.mockResolvedValue({ id: 1, name: 'ws', workspaceGroup: { id: 2 } } as Workspace);

      const result = await service.findOne(1);

      expect(unitRepository.find).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ workspaceId: 1 })
      }));
      expect(result.units).toEqual([12, 10]);
    });

    it('should leave the password out on the review route, and keep it for the management (#1784)', async () => {
      reviewRepository.findOne.mockResolvedValue({ id: 1, workspaceId: 1, password: 'geheim' } as Review);
      reviewUnitRepository.find.mockResolvedValue([]);
      unitRepository.find.mockResolvedValue([]);
      workspaceRepository.findOne.mockResolvedValue({ id: 1, name: 'ws', workspaceGroup: { id: 2 } } as Workspace);

      expect(await service.findOne(1)).not.toHaveProperty('password');
      expect((await service.findOne(1, 1)).password).toBe('geheim');
    });

    it('should leave the stored units of the review untouched', async () => {
      reviewRepository.findOne.mockResolvedValue({ id: 1, workspaceId: 1 } as Review);
      reviewUnitRepository.find.mockResolvedValue([{ unitId: 10 }, { unitId: 11 }] as ReviewUnit[]);
      unitRepository.find.mockResolvedValue([{ id: 10 }] as Unit[]);
      workspaceRepository.findOne.mockResolvedValue({ id: 1, name: 'ws', workspaceGroup: { id: 2 } } as Workspace);

      await service.findOne(1);

      expect(reviewUnitRepository.delete).not.toHaveBeenCalled();
      expect(reviewUnitRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findUnitProperties', () => {
    it('should return units properties', async () => {
      reviewRepository.findOne.mockResolvedValue({ workspaceId: 1 } as Review);
      unitService.findOnesProperties.mockResolvedValue({} as UnitPropertiesDto);

      await service.findUnitProperties(10, 1);
      expect(unitService.findOnesProperties).toHaveBeenCalledWith(10, 1);
    });

    const properties = {
      id: 10, key: 'U10', description: 'Beschreibung', metadata: { profiles: [{ profileId: 'p' }] }
    } as UnitPropertiesDto;

    const reviewShowingMetadata = (showMetadata: boolean) => (
      { workspaceId: 1, settings: { reviewConfig: { showMetadata } } } as Review
    );

    it('should return the properties as they are when the review shows metadata', async () => {
      reviewRepository.findOne.mockResolvedValue(reviewShowingMetadata(true));
      unitService.findOnesProperties.mockResolvedValue(properties);

      expect(await service.findUnitProperties(10, 1)).toBe(properties);
    });

    it('should leave the metadata out when the review does not show it (#1784)', async () => {
      reviewRepository.findOne.mockResolvedValue(reviewShowingMetadata(false));
      unitService.findOnesProperties.mockResolvedValue(properties);

      const result = await service.findUnitProperties(10, 1);
      expect(result.key).toBe('U10');
      expect(result).not.toHaveProperty('description');
      expect(result.metadata).toEqual({ items: [] });
    });
  });

  describe('reviewConfigOf', () => {
    it('should return the review\'s settings', async () => {
      reviewRepository.findOne.mockResolvedValue({ settings: { reviewConfig: { canComment: true } } } as Review);

      expect(await service.reviewConfigOf(1)).toEqual({ canComment: true });
      expect(reviewRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 }, select: { settings: true } });
    });

    it('should return no settings for a review without any, and for one that does not exist', async () => {
      reviewRepository.findOne.mockResolvedValueOnce({ settings: {} } as Review);
      reviewRepository.findOne.mockResolvedValueOnce(null);

      expect(await service.reviewConfigOf(1)).toEqual({});
      expect(await service.reviewConfigOf(999)).toEqual({});
    });
  });

  describe('workspaceIdOf', () => {
    it('should return the workspace of the review', async () => {
      reviewRepository.findOne.mockResolvedValue({ workspaceId: 4 } as Review);

      expect(await service.workspaceIdOf(1)).toBe(4);
      expect(reviewRepository.findOne)
        .toHaveBeenCalledWith({ where: { id: 1 }, select: { workspaceId: true } });
    });

    it('should return null for a review that does not exist', async () => {
      reviewRepository.findOne.mockResolvedValue(null);

      expect(await service.workspaceIdOf(999)).toBeNull();
    });
  });

  describe('findOneForAuth', () => {
    it('should return review dto', async () => {
      reviewRepository.findOne.mockResolvedValue({ id: 1, name: 'r' } as Review);
      const result = await service.findOneForAuth(1);
      expect(result.id).toBe(1);
    });
  });

  describe('findAllByUser', () => {
    it('should return reviews for user', async () => {
      workspaceUsersRepository.find.mockResolvedValue([{ workspaceId: 1 }] as WorkspaceUser[]);

      const workspace = {
        id: 1,
        name: 'ws',
        workspaceGroup: { id: 2, name: 'wg' }
      } as Workspace;

      workspaceRepository.find.mockResolvedValue([workspace]);

      const reviews = [{ id: 1, workspaceId: 1 }] as Review[];
      reviewRepository.find.mockResolvedValue(reviews);

      const result = await service.findAllByUser(1);
      expect(result).toHaveLength(1);
      expect(result[0].workspaceName).toBe('ws');
    });
  });

  describe('patch', () => {
    // Which of the given units the workspace holds -- all of them unless a test says otherwise.
    const unitsInWorkspace = (...ids: number[]) => unitRepository.find
      .mockResolvedValue(ids.map(id => ({ id }) as Unit));

    it('should throw if name missing in patch data', async () => {
      await expect(service.patch(3, 1, { id: 1 } as ReviewFullDto)).rejects.toThrow(ReviewUnprocessableException);
    });

    it('should update review', async () => {
      const review = { id: 1, name: 'old' } as Review;
      reviewRepository.findOne.mockResolvedValue(review);
      // mocking property assignment on object is implicitly handled since review is an object
      unitsInWorkspace(10);

      await service.patch(3, 1, { id: 1, name: 'new', units: [10] } as ReviewFullDto);

      expect(reviewRepository.save).toHaveBeenCalled();
      expect(reviewUnitRepository.delete).toHaveBeenCalledWith({ reviewId: 1 });
      expect(reviewUnitRepository.create).toHaveBeenCalled();
      expect(reviewUnitRepository.save).toHaveBeenCalled();
    });

    it('should replace the units with their list order in one save', async () => {
      const review = { id: 1, name: 'old' } as Review;
      reviewRepository.findOne.mockResolvedValue(review);
      reviewUnitRepository.create.mockImplementation(entity => entity as ReviewUnit);
      unitsInWorkspace(10, 20, 30);

      await service.patch(3, 1, { id: 1, name: 'new', units: [30, 10, 20] } as ReviewFullDto);

      expect(reviewUnitRepository.save).toHaveBeenCalledWith([
        { reviewId: 1, unitId: 30, order: 0 },
        { reviewId: 1, unitId: 10, order: 1 },
        { reviewId: 1, unitId: 20, order: 2 }
      ]);
    });

    it('should not resolve before the review units are persisted', async () => {
      const review = { id: 1, name: 'old' } as Review;
      reviewRepository.findOne.mockResolvedValue(review);
      let unitsPersisted = false;
      reviewUnitRepository.save.mockImplementation(async entity => {
        await new Promise(resolve => { setTimeout(resolve, 0); });
        unitsPersisted = true;
        return entity as ReviewUnit;
      });
      unitsInWorkspace(10, 20);

      await service.patch(3, 1, { id: 1, name: 'new', units: [10, 20] } as ReviewFullDto);

      expect(unitsPersisted).toBe(true);
    });

    it('should reject when persisting the review units fails', async () => {
      const review = { id: 1, name: 'old' } as Review;
      reviewRepository.findOne.mockResolvedValue(review);
      reviewUnitRepository.save.mockRejectedValue(new Error('insert failed'));
      unitsInWorkspace(10);

      await expect(service.patch(3, 1, { id: 1, name: 'new', units: [10] } as ReviewFullDto))
        .rejects.toThrow('insert failed');
    });

    it('should treat a review of another workspace as missing and change nothing', async () => {
      reviewRepository.findOne.mockResolvedValue(null);

      await expect(service.patch(3, 1, { id: 1, name: 'new' } as ReviewFullDto)).rejects.toThrow(NotFoundException);
      expect(reviewRepository.findOne).toHaveBeenCalledWith({ where: { id: 1, workspaceId: 3 } });
      expect(reviewRepository.save).not.toHaveBeenCalled();
    });

    // A reviewer reads a unit by its id once it is in the review; one of another workspace would
    // be served to everyone with the link. It is left out rather than refused: a unit moved away
    // since stays in the list the dialog sends back, and the review has to remain savable.
    it('should keep only the units of the review\'s workspace, in their order', async () => {
      reviewRepository.findOne.mockResolvedValue({ id: 1, name: 'old' } as Review);
      reviewUnitRepository.create.mockImplementation(entity => entity as ReviewUnit);
      unitsInWorkspace(10, 30);

      await service.patch(3, 1, { id: 1, name: 'new', units: [30, 77, 10] } as ReviewFullDto);

      expect(unitRepository.find).toHaveBeenCalledWith({
        where: { id: expect.objectContaining({ value: [30, 77, 10] }), workspaceId: 3 },
        select: { id: true }
      });
      expect(reviewUnitRepository.save).toHaveBeenCalledWith([
        { reviewId: 1, unitId: 30, order: 0 },
        { reviewId: 1, unitId: 10, order: 1 }
      ]);
    });

    it('should keep a unit listed twice once', async () => {
      reviewRepository.findOne.mockResolvedValue({ id: 1, name: 'old' } as Review);
      reviewUnitRepository.create.mockImplementation(entity => entity as ReviewUnit);
      unitsInWorkspace(10);

      await service.patch(3, 1, { id: 1, name: 'new', units: [10, 10] } as ReviewFullDto);

      expect(reviewUnitRepository.save).toHaveBeenCalledWith([{ reviewId: 1, unitId: 10, order: 0 }]);
    });

    it('should not ask about units when none are given', async () => {
      reviewRepository.findOne.mockResolvedValue({ id: 1, name: 'old' } as Review);

      await service.patch(3, 1, { id: 1, name: 'new', units: [] } as ReviewFullDto);

      expect(unitRepository.find).not.toHaveBeenCalled();
      expect(reviewUnitRepository.save).toHaveBeenCalledWith([]);
    });
  });

  describe('remove', () => {
    it('should remove review', async () => {
      reviewRepository.findOne.mockResolvedValue({ id: 1, workspaceId: 3 } as Review);

      await service.remove(3, 1);
      expect(reviewRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should not remove a review of another workspace', async () => {
      reviewRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(3, 1)).rejects.toThrow(NotFoundException);
      expect(reviewRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('isUnitInReview', () => {
    it('should be true for a unit the review contains', async () => {
      reviewUnitRepository.findOne.mockResolvedValue({ unitId: 10 } as ReviewUnit);
      reviewRepository.findOne.mockResolvedValue({ workspaceId: 3 } as Review);
      unitRepository.exists.mockResolvedValue(true);

      expect(await service.isUnitInReview(1, 10)).toBe(true);
      expect(reviewUnitRepository.findOne).toHaveBeenCalledWith({
        where: { reviewId: 1, unitId: 10 },
        select: { unitId: true }
      });
      expect(unitRepository.exists).toHaveBeenCalledWith({ where: { id: 10, workspaceId: 3 } });
    });

    it('should be false for a unit the review does not contain', async () => {
      reviewUnitRepository.findOne.mockResolvedValue(null);
      expect(await service.isUnitInReview(1, 999)).toBe(false);
      expect(unitRepository.exists).not.toHaveBeenCalled();
    });

    // The review routes load a unit by its id; one moved out of the review's workspace since, or
    // put into the review from another one, is not served (#1717).
    it('should be false for a unit that is no longer in the review\'s workspace', async () => {
      reviewUnitRepository.findOne.mockResolvedValue({ unitId: 10 } as ReviewUnit);
      reviewRepository.findOne.mockResolvedValue({ workspaceId: 3 } as Review);
      unitRepository.exists.mockResolvedValue(false);

      expect(await service.isUnitInReview(1, 10)).toBe(false);
    });
  });

  describe('getReviewByKeyAndPassword', () => {
    it('should return id if found', async () => {
      reviewRepository.findOne.mockResolvedValue({ id: 1 } as Review);
      expect(await service.getReviewByKeyAndPassword('key', 'pass')).toBe(1);
    });

    it('should return null if not found', async () => {
      reviewRepository.findOne.mockResolvedValue(null);
      expect(await service.getReviewByKeyAndPassword('key', 'pass')).toBeNull();
    });
  });
});
