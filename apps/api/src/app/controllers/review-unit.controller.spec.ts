import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { UnitPropertiesDto } from '@studio-lite-lib/api-dto';
import { ReviewUnitController } from './review-unit.controller';
import { ReviewService } from '../services/review.service';
import { UnitDefinitionService } from '../services/unit-definition.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ReviewGuard } from '../guards/review.guard';
import { ReviewConfigGuard } from '../guards/review-config.guard';

describe('ReviewUnitController', () => {
  let controller: ReviewUnitController;
  let reviewService: ReviewService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewUnitController],
      providers: [
        {
          provide: ReviewService,
          useValue: createMock<ReviewService>()
        },
        {
          provide: UnitDefinitionService,
          useValue: createMock<UnitDefinitionService>()
        }
      ]
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(ReviewGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(ReviewConfigGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ReviewUnitController>(ReviewUnitController);
    reviewService = module.get<ReviewService>(ReviewService);
  });

  describe('findUnitProperties', () => {
    it('should return unit properties', async () => {
      const reviewId = 1;
      const unitId = 10;
      const mockProperties: UnitPropertiesDto = {
        id: unitId,
        key: 'unit-key',
        name: 'Test Unit',
        description: 'Test Description',
        editor: 'test-editor',
        schemer: 'test-schemer',
        player: 'test-player',
        lastModifiedUser: 'testuser',
        lastModifiedTime: new Date().toISOString()
      } as UnitPropertiesDto;

      jest.spyOn(reviewService, 'findUnitProperties')
        .mockResolvedValue(mockProperties);

      const result = await controller.findUnitProperties(reviewId, unitId);

      expect(result).toEqual(mockProperties);
      expect(reviewService.findUnitProperties).toHaveBeenCalledWith(unitId, reviewId);
      expect(reviewService.findUnitProperties).toHaveBeenCalledTimes(1);
    });
  });
});
