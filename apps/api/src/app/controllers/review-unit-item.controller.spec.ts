import { UnitItemDto, UnitItemWithMetadataDto } from '@studio-lite-lib/api-dto';
import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { ReviewUnitItemController } from './review-unit-item.controller';
import { UnitItemService } from '../services/unit-item.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

describe('ReviewUnitItemController', () => {
  let controller: ReviewUnitItemController;
  let unitItemsService: UnitItemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewUnitItemController],
      providers: [
        {
          provide: UnitItemService,
          useValue: createMock<UnitItemService>()
        }
      ]
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ReviewUnitItemController>(ReviewUnitItemController);
    unitItemsService = module.get<UnitItemService>(UnitItemService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return items without metadata when withoutMetadata is true', async () => {
      const unitId = 10;
      const mockItems: UnitItemDto[] = [
        {
          uuid: 'uuid-1',
          type: 'type-1',
          content: 'content-1'
        } as UnitItemDto,
        {
          uuid: 'uuid-2',
          type: 'type-2',
          content: 'content-2'
        } as UnitItemDto
      ];

      jest.spyOn(unitItemsService, 'getAllByUnitId')
        .mockResolvedValue(mockItems);

      const result = await controller.findAll(unitId, true);

      expect(result).toEqual(mockItems);
      expect(unitItemsService.getAllByUnitId).toHaveBeenCalledWith(unitId);
      expect(unitItemsService.getAllByUnitId).toHaveBeenCalledTimes(1);
      expect(unitItemsService.getAllByUnitIdWithMetadata).not.toHaveBeenCalled();
    });

    it('should return items with metadata when withoutMetadata is false', async () => {
      const unitId = 10;
      const mockItemsWithMetadata: UnitItemWithMetadataDto[] = [
        {
          uuid: 'uuid-1',
          type: 'type-1',
          content: 'content-1',
          profiles: [{ unitItemUuid: 'uuid-1' }]
        } as unknown as UnitItemWithMetadataDto,
        {
          uuid: 'uuid-2',
          type: 'type-2',
          content: 'content-2',
          profiles: [{ unitItemUuid: 'uuid-2' }]
        } as unknown as UnitItemWithMetadataDto
      ];

      jest.spyOn(unitItemsService, 'getAllByUnitIdWithMetadata')
        .mockResolvedValue(mockItemsWithMetadata);

      const result = await controller.findAll(unitId, false);

      expect(result).toEqual(mockItemsWithMetadata);
      expect(unitItemsService.getAllByUnitIdWithMetadata).toHaveBeenCalledWith(unitId);
      expect(unitItemsService.getAllByUnitIdWithMetadata).toHaveBeenCalledTimes(1);
      expect(unitItemsService.getAllByUnitId).not.toHaveBeenCalled();
    });

    it('should return items with metadata when withoutMetadata is undefined', async () => {
      const unitId = 10;
      const mockItemsWithMetadata: UnitItemWithMetadataDto[] = [
        {
          uuid: 'uuid-3',
          type: 'type-3',
          content: 'content-3',
          profiles: [{ unitItemUuid: 'uuid-3' }]
        } as unknown as UnitItemWithMetadataDto
      ];

      jest.spyOn(unitItemsService, 'getAllByUnitIdWithMetadata')
        .mockResolvedValue(mockItemsWithMetadata);

      const result = await controller.findAll(unitId, undefined as unknown as boolean);

      expect(result).toEqual(mockItemsWithMetadata);
      expect(unitItemsService.getAllByUnitIdWithMetadata).toHaveBeenCalledWith(unitId);
      expect(unitItemsService.getAllByUnitId).not.toHaveBeenCalled();
    });

    it('should return empty array when no items exist without metadata', async () => {
      const unitId = 10;

      jest.spyOn(unitItemsService, 'getAllByUnitId')
        .mockResolvedValue([]);

      const result = await controller.findAll(unitId, true);

      expect(result).toEqual([]);
      expect(unitItemsService.getAllByUnitId).toHaveBeenCalledWith(unitId);
    });

    it('should return empty array when no items exist with metadata', async () => {
      const unitId = 10;

      jest.spyOn(unitItemsService, 'getAllByUnitIdWithMetadata')
        .mockResolvedValue([]);

      const result = await controller.findAll(unitId, false);

      expect(result).toEqual([]);
      expect(unitItemsService.getAllByUnitIdWithMetadata).toHaveBeenCalledWith(unitId);
    });

    it('should handle different unit ids', async () => {
      const unitId = 99;
      const mockItems: UnitItemDto[] = [
        {
          uuid: 'uuid-99',
          type: 'type-99',
          content: 'content-99'
        } as UnitItemDto
      ];

      jest.spyOn(unitItemsService, 'getAllByUnitId')
        .mockResolvedValue(mockItems);

      const result = await controller.findAll(unitId, true);

      expect(result).toEqual(mockItems);
      expect(unitItemsService.getAllByUnitId).toHaveBeenCalledWith(unitId);
    });
  });
});
