import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import {
  UnitDefinitionDto,
  UnitPropertiesDto,
  UnitSchemeDto
} from '@studio-lite-lib/api-dto';
import { ReviewUnitController } from './review-unit.controller';
import { ReviewService } from '../services/review.service';
import { UnitService } from '../services/unit.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

describe('ReviewUnitController', () => {
  let controller: ReviewUnitController;
  let reviewService: ReviewService;
  let unitService: UnitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewUnitController],
      providers: [
        {
          provide: ReviewService,
          useValue: createMock<ReviewService>()
        },
        {
          provide: UnitService,
          useValue: createMock<UnitService>()
        }
      ]
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ReviewUnitController>(ReviewUnitController);
    reviewService = module.get<ReviewService>(ReviewService);
    unitService = module.get<UnitService>(UnitService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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

    it('should handle different review and unit ids', async () => {
      const reviewId = 2;
      const unitId = 20;
      const mockProperties: UnitPropertiesDto = {
        id: unitId,
        key: 'another-unit-key',
        name: 'Another Unit'
      } as UnitPropertiesDto;

      jest.spyOn(reviewService, 'findUnitProperties')
        .mockResolvedValue(mockProperties);

      const result = await controller.findUnitProperties(reviewId, unitId);

      expect(result).toEqual(mockProperties);
      expect(reviewService.findUnitProperties).toHaveBeenCalledWith(unitId, reviewId);
    });
  });

  describe('getUnitDefinition', () => {
    it('should return unit definition', async () => {
      const unitId = 10;
      const mockDefinition: UnitDefinitionDto = {
        id: unitId,
        definition: '{"test": "definition"}',
        variables: []
      } as UnitDefinitionDto;

      jest.spyOn(unitService, 'findOnesDefinition')
        .mockResolvedValue(mockDefinition);

      const result = await controller.getUnitDefinition(unitId);

      expect(result).toEqual(mockDefinition);
      expect(unitService.findOnesDefinition).toHaveBeenCalledWith(unitId);
      expect(unitService.findOnesDefinition).toHaveBeenCalledTimes(1);
    });

    it('should handle different unit ids', async () => {
      const unitId = 50;
      const mockDefinition: UnitDefinitionDto = {
        id: unitId,
        definition: '{"another": "definition"}',
        variables: []
      } as UnitDefinitionDto;

      jest.spyOn(unitService, 'findOnesDefinition')
        .mockResolvedValue(mockDefinition);

      const result = await controller.getUnitDefinition(unitId);

      expect(result).toEqual(mockDefinition);
      expect(unitService.findOnesDefinition).toHaveBeenCalledWith(unitId);
    });
  });

  describe('findOnesScheme', () => {
    it('should return unit scheme', async () => {
      const unitId = 10;
      const mockScheme: UnitSchemeDto = {
        id: unitId,
        scheme: '{"test": "scheme"}',
        schemeType: 'test-type'
      } as UnitSchemeDto;

      jest.spyOn(unitService, 'findOnesScheme')
        .mockResolvedValue(mockScheme);

      const result = await controller.findOnesScheme(unitId);

      expect(result).toEqual(mockScheme);
      expect(unitService.findOnesScheme).toHaveBeenCalledWith(unitId);
      expect(unitService.findOnesScheme).toHaveBeenCalledTimes(1);
    });

    it('should handle different unit ids', async () => {
      const unitId = 99;
      const mockScheme: UnitSchemeDto = {
        id: unitId,
        scheme: '{"another": "scheme"}',
        schemeType: 'another-type'
      } as UnitSchemeDto;

      jest.spyOn(unitService, 'findOnesScheme')
        .mockResolvedValue(mockScheme);

      const result = await controller.findOnesScheme(unitId);

      expect(result).toEqual(mockScheme);
      expect(unitService.findOnesScheme).toHaveBeenCalledWith(unitId);
    });
  });
});
