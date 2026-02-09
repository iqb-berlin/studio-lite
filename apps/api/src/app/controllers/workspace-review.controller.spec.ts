import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { CreateReviewDto, ReviewFullDto, ReviewInListDto } from '@studio-lite-lib/api-dto';
import { WorkspaceReviewController } from './workspace-review.controller';
import { ReviewService } from '../services/review.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { WorkspaceGuard } from '../guards/workspace.guard';

describe('WorkspaceReviewController', () => {
  let controller: WorkspaceReviewController;
  let reviewService: ReviewService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkspaceReviewController],
      providers: [
        { provide: ReviewService, useValue: createMock<ReviewService>() }
      ]
    })
      .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
      .overrideGuard(WorkspaceGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<WorkspaceReviewController>(WorkspaceReviewController);
    reviewService = module.get<ReviewService>(ReviewService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all reviews for a workspace', async () => {
      const result: ReviewInListDto[] = [];
      jest.spyOn(reviewService, 'findAll').mockResolvedValue(result);

      expect(await controller.findAll(1)).toBe(result);
      expect(reviewService.findAll).toHaveBeenCalledWith(1);
    });
  });

  describe('findOne', () => {
    it('should return a review', async () => {
      const result: ReviewFullDto = { id: 1, name: 'Review', workspaceId: 1 } as ReviewFullDto;
      jest.spyOn(reviewService, 'findOne').mockResolvedValue(result);

      expect(await controller.findOne(1)).toBe(result);
      expect(reviewService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('patchReview', () => {
    it('should patch a review', async () => {
      const dto: ReviewFullDto = { id: 1, name: 'New Name' } as ReviewFullDto;
      jest.spyOn(reviewService, 'patch').mockResolvedValue(undefined);

      await controller.patchReview(1, dto);
      expect(reviewService.patch).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('create', () => {
    it('should create a review', async () => {
      const dto: CreateReviewDto = { name: 'New Review', workspaceId: 1 } as CreateReviewDto;
      jest.spyOn(reviewService, 'create').mockResolvedValue(1);

      expect(await controller.create(dto)).toBe(1);
      expect(reviewService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('remove', () => {
    it('should remove a review', async () => {
      jest.spyOn(reviewService, 'remove').mockResolvedValue(undefined);

      await controller.remove(1);
      expect(reviewService.remove).toHaveBeenCalledWith(1);
    });
  });
});
