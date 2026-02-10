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
import { UnitService } from './unit.service';
import { ReviewUnprocessableException } from '../exceptions/review-unprocessable.exception';

describe('ReviewService', () => {
  let service: ReviewService;
  let reviewRepository: DeepMocked<Repository<Review>>;
  let reviewUnitRepository: DeepMocked<Repository<ReviewUnit>>;
  let workspaceUsersRepository: DeepMocked<Repository<WorkspaceUser>>;
  let workspaceRepository: DeepMocked<Repository<Workspace>>;
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
      await expect(service.create({} as CreateReviewDto)).rejects.toThrow(ReviewUnprocessableException);
    });

    it('should create review', async () => {
      const createDto = { name: 'test', workspaceId: 1 };
      reviewRepository.create.mockReturnValue({ id: 1 } as Review);
      reviewRepository.save.mockResolvedValue({ id: 1 } as Review);

      const result = await service.create(createDto);
      expect(result).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should throw if not found', async () => {
      reviewRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });

    it('should return review details', async () => {
      const review = { id: 1, workspaceId: 1 } as Review;
      reviewRepository.findOne.mockResolvedValue(review);

      reviewUnitRepository.find.mockResolvedValue([{ unitId: 10 }] as ReviewUnit[]);

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
  });

  describe('findUnitProperties', () => {
    it('should return units properties', async () => {
      reviewRepository.findOne.mockResolvedValue({ workspaceId: 1 } as Review);
      unitService.findOnesProperties.mockResolvedValue({} as UnitPropertiesDto);

      await service.findUnitProperties(10, 1);
      expect(unitService.findOnesProperties).toHaveBeenCalledWith(10, 1);
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
    it('should throw if name missing in patch data', async () => {
      await expect(service.patch(1, { id: 1 } as ReviewFullDto)).rejects.toThrow(ReviewUnprocessableException);
    });

    it('should update review', async () => {
      const review = { id: 1, name: 'old' } as Review;
      reviewRepository.findOne.mockResolvedValue(review);
      // mocking property assignment on object is implicitly handled since review is an object

      await service.patch(1, { id: 1, name: 'new', units: [10] } as ReviewFullDto);

      expect(reviewRepository.save).toHaveBeenCalled();
      expect(reviewUnitRepository.delete).toHaveBeenCalledWith({ reviewId: 1 });
      expect(reviewUnitRepository.create).toHaveBeenCalled();
      expect(reviewUnitRepository.save).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove review', async () => {
      await service.remove(1);
      expect(reviewRepository.delete).toHaveBeenCalledWith(1);
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
