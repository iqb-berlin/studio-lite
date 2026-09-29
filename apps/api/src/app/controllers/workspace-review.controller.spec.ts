import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { CreateReviewDto, ReviewFullDto, ReviewInListDto } from '@studio-lite-lib/api-dto';
import { WorkspaceReviewController } from './workspace-review.controller';
import { ReviewService } from '../services/review.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { WorkspaceGuard } from '../guards/workspace.guard';
import { ManageOrGroupAdminAccessGuard } from '../guards/manage-or-group-admin-access.guard';

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
      .overrideGuard(ManageOrGroupAdminAccessGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<WorkspaceReviewController>(WorkspaceReviewController);
    reviewService = module.get<ReviewService>(ReviewService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Creating, changing and deleting a review asked WorkspaceGuard alone, which a commenter passes
  // (#1715); reading the reviews stays open to every member.
  it.each(['create', 'patchReview', 'remove'] as const)('should guard %s with the manage level', method => {
    expect(Reflect.getMetadata('__guards__', WorkspaceReviewController.prototype[method]))
      .toEqual([JwtAuthGuard, WorkspaceGuard, ManageOrGroupAdminAccessGuard]);
  });

  it.each(['findAll', 'findOne'] as const)('should leave %s to every member', method => {
    expect(Reflect.getMetadata('__guards__', WorkspaceReviewController.prototype[method]))
      .toEqual([JwtAuthGuard, WorkspaceGuard]);
  });

  describe('findAll', () => {
    it('should return all reviews for a workspace', async () => {
      const result: ReviewInListDto[] = [];
      jest.spyOn(reviewService, 'findAll').mockResolvedValue(result);

      expect(await controller.findAll(1)).toBe(result);
      expect(reviewService.findAll).toHaveBeenCalledWith(1);
    });
  });

  // Every route hands the workspace of the path on: the guards checked the level there, and the
  // service holds the review to it (#1717).
  describe('findOne', () => {
    it('should return a review of the workspace in the path', async () => {
      const result: ReviewFullDto = { id: 1, name: 'Review', workspaceId: 3 } as ReviewFullDto;
      jest.spyOn(reviewService, 'findOne').mockResolvedValue(result);

      expect(await controller.findOne(3, 1)).toBe(result);
      expect(reviewService.findOne).toHaveBeenCalledWith(1, 3);
    });
  });

  describe('patchReview', () => {
    it('should patch a review of the workspace in the path', async () => {
      const dto: ReviewFullDto = { id: 1, name: 'New Name' } as ReviewFullDto;
      jest.spyOn(reviewService, 'patch').mockResolvedValue(undefined);

      await controller.patchReview(3, 1, dto);
      expect(reviewService.patch).toHaveBeenCalledWith(3, 1, dto);
    });
  });

  describe('create', () => {
    it('should create the review in the workspace of the path', async () => {
      const dto: CreateReviewDto = { name: 'New Review', workspaceId: 9 } as CreateReviewDto;
      jest.spyOn(reviewService, 'create').mockResolvedValue(1);

      expect(await controller.create(3, dto)).toBe(1);
      expect(reviewService.create).toHaveBeenCalledWith(3, dto);
    });
  });

  describe('remove', () => {
    it('should remove a review of the workspace in the path', async () => {
      jest.spyOn(reviewService, 'remove').mockResolvedValue(undefined);

      await controller.remove(3, 1);
      expect(reviewService.remove).toHaveBeenCalledWith(3, 1);
    });
  });
});
