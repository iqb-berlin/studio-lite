import { ReviewFullDto } from '@studio-lite-lib/api-dto';
import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { ReviewController } from './review.controller';
import { ReviewService } from '../services/review.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

describe('ReviewController', () => {
  let controller: ReviewController;
  let reviewService: ReviewService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewController],
      providers: [
        {
          provide: ReviewService,
          useValue: createMock<ReviewService>()
        }
      ]
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ReviewController>(ReviewController);
    reviewService = module.get<ReviewService>(ReviewService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a review by id', async () => {
      const reviewId = 1;
      const mockReview: ReviewFullDto = {
        id: reviewId,
        name: 'Test Review',
        workspaceId: 1,
        workspaceName: 'Test Workspace',
        password: 'test-password',
        link: 'http://example.com/review/1',
        units: []
      } as ReviewFullDto;

      jest.spyOn(reviewService, 'findOne')
        .mockResolvedValue(mockReview);

      const result = await controller.findOne(reviewId);

      expect(result).toEqual(mockReview);
      expect(reviewService.findOne).toHaveBeenCalledWith(reviewId);
      expect(reviewService.findOne).toHaveBeenCalledTimes(1);
    });

    it('should handle different review ids', async () => {
      const reviewId = 999;
      const mockReview: ReviewFullDto = {
        id: reviewId,
        name: 'Another Review',
        workspaceId: 2,
        workspaceName: 'Another Workspace',
        password: 'another-password',
        link: 'http://example.com/review/999',
        units: []
      } as ReviewFullDto;

      jest.spyOn(reviewService, 'findOne')
        .mockResolvedValue(mockReview);

      const result = await controller.findOne(reviewId);

      expect(result).toEqual(mockReview);
      expect(reviewService.findOne).toHaveBeenCalledWith(reviewId);
    });
  });
});
