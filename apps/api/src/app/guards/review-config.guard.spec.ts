import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ReviewConfigGuard } from './review-config.guard';
import { ReviewService } from '../services/review.service';
import { ReviewConfigSetting } from '../decorators/review-config-required.decorator';

describe('ReviewConfigGuard', () => {
  let guard: ReviewConfigGuard;
  let reviewService: DeepMocked<ReviewService>;
  let reflector: DeepMocked<Reflector>;

  const context = createMock<ExecutionContext>({
    switchToHttp: () => ({
      getRequest: () => ({ params: { review_id: '2' } })
    })
  });

  const requiring = (...settings: ReviewConfigSetting[]) => reflector.getAllAndOverride.mockReturnValue(settings);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ReviewService,
          useValue: createMock<ReviewService>()
        },
        {
          provide: Reflector,
          useValue: createMock<Reflector>()
        },
        ReviewConfigGuard
      ]
    }).compile();

    guard = module.get<ReviewConfigGuard>(ReviewConfigGuard);
    reviewService = module.get(ReviewService);
    reflector = module.get(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should pass a route that requires no setting, without loading the review', async () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    expect(await guard.canActivate(context)).toBe(true);
    expect(reviewService.reviewConfigOf).not.toHaveBeenCalled();
  });

  it('should pass when the required setting is on', async () => {
    requiring('canComment');
    reviewService.reviewConfigOf.mockResolvedValue({ canComment: true });

    expect(await guard.canActivate(context)).toBe(true);
    expect(reviewService.reviewConfigOf).toHaveBeenCalledWith(2);
  });

  it('should throw ForbiddenException when the required setting is off', async () => {
    requiring('canComment');
    reviewService.reviewConfigOf.mockResolvedValue({ canComment: false });

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException when the review leaves the setting out', async () => {
    requiring('showCoding');
    reviewService.reviewConfigOf.mockResolvedValue({});

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  it('should require every setting the route names', async () => {
    requiring('canComment', 'showOthersComments');
    reviewService.reviewConfigOf.mockResolvedValue({ canComment: true, showOthersComments: false });

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });
});
