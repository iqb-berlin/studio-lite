import { UnitItemMetadataDto } from '@studio-lite-lib/api-dto';
import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { UnitItemMetadataController } from './unit-item-metadata.controller';
import { UnitItemMetadataService } from '../services/unit-item-metadata.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { WorkspaceGuard } from '../guards/workspace.guard';
import { AppVersionGuard } from '../guards/app-version.guard';
import { WriteAccessGuard } from '../guards/write-access.guard';
import { WorkspaceAccessGuard } from '../guards/workspace-access.guard';

describe('UnitItemMetadataController', () => {
  let controller: UnitItemMetadataController;
  let unitItemMetadataService: UnitItemMetadataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UnitItemMetadataController],
      providers: [
        {
          provide: UnitItemMetadataService,
          useValue: createMock<UnitItemMetadataService>()
        }
      ]
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(WorkspaceGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(AppVersionGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(WriteAccessGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(WorkspaceAccessGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UnitItemMetadataController>(UnitItemMetadataController);
    unitItemMetadataService = module.get<UnitItemMetadataService>(UnitItemMetadataService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of metadata for an item', async () => {
      const itemUuid = 'test-uuid-123';
      const mockMetadata: UnitItemMetadataDto[] = [
        {
          id: 1,
          unitItemUuid: itemUuid,
          entries: [{ key: 'metadata-key-1', value: 'metadata-value-1' }]
        } as unknown as UnitItemMetadataDto,
        {
          id: 2,
          unitItemUuid: itemUuid,
          entries: [{ key: 'metadata-key-2', value: 'metadata-value-2' }]
        } as unknown as UnitItemMetadataDto
      ];

      jest.spyOn(unitItemMetadataService, 'getAllByItemId')
        .mockResolvedValue(mockMetadata);

      const result = await controller.findAll(itemUuid);

      expect(result).toEqual(mockMetadata);
      expect(unitItemMetadataService.getAllByItemId).toHaveBeenCalledWith(itemUuid);
      expect(unitItemMetadataService.getAllByItemId).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array when no metadata exists', async () => {
      const itemUuid = 'test-uuid-empty';

      jest.spyOn(unitItemMetadataService, 'getAllByItemId')
        .mockResolvedValue([]);

      const result = await controller.findAll(itemUuid);

      expect(result).toEqual([]);
      expect(unitItemMetadataService.getAllByItemId).toHaveBeenCalledWith(itemUuid);
    });

    it('should handle different item uuids', async () => {
      const itemUuid = 'another-uuid-456';
      const mockMetadata: UnitItemMetadataDto[] = [
        {
          id: 3,
          unitItemUuid: itemUuid,
          entries: [{ key: 'another-key', value: 'another-value' }]
        } as unknown as UnitItemMetadataDto
      ];

      jest.spyOn(unitItemMetadataService, 'getAllByItemId')
        .mockResolvedValue(mockMetadata);

      const result = await controller.findAll(itemUuid);

      expect(result).toEqual(mockMetadata);
      expect(unitItemMetadataService.getAllByItemId).toHaveBeenCalledWith(itemUuid);
    });
  });

  describe('create', () => {
    it('should create metadata and return its id', async () => {
      const itemUuid = 'test-uuid-123';
      const metadataDto: UnitItemMetadataDto = {
        unitItemUuid: itemUuid,
        entries: [{ key: 'new-key', value: 'new-value' }]
      } as unknown as UnitItemMetadataDto;
      const newMetadataId = 5;

      jest.spyOn(unitItemMetadataService, 'addItemMetadata')
        .mockResolvedValue(newMetadataId);

      const result = await controller.create(itemUuid, metadataDto);

      expect(result).toBe(newMetadataId);
      expect(unitItemMetadataService.addItemMetadata).toHaveBeenCalledWith(itemUuid, metadataDto);
      expect(unitItemMetadataService.addItemMetadata).toHaveBeenCalledTimes(1);
    });

    it('should handle different metadata values', async () => {
      const itemUuid = 'another-uuid-456';
      const metadataDto: UnitItemMetadataDto = {
        unitItemUuid: itemUuid,
        entries: [{ key: 'different-key', value: 'different-value' }]
      } as unknown as UnitItemMetadataDto;
      const newMetadataId = 10;

      jest.spyOn(unitItemMetadataService, 'addItemMetadata')
        .mockResolvedValue(newMetadataId);

      const result = await controller.create(itemUuid, metadataDto);

      expect(result).toBe(newMetadataId);
      expect(unitItemMetadataService.addItemMetadata).toHaveBeenCalledWith(itemUuid, metadataDto);
    });

    it('should handle complex metadata objects', async () => {
      const itemUuid = 'complex-uuid-789';
      const metadataDto: UnitItemMetadataDto = {
        unitItemUuid: itemUuid,
        entries: [{ key: 'complex-key', value: JSON.stringify({ nested: { data: 'value' } }) }]
      } as unknown as UnitItemMetadataDto;
      const newMetadataId = 15;

      jest.spyOn(unitItemMetadataService, 'addItemMetadata')
        .mockResolvedValue(newMetadataId);

      const result = await controller.create(itemUuid, metadataDto);

      expect(result).toBe(newMetadataId);
      expect(unitItemMetadataService.addItemMetadata).toHaveBeenCalledWith(itemUuid, metadataDto);
    });
  });

  describe('remove', () => {
    it('should remove metadata by id', async () => {
      const metadataId = 1;

      jest.spyOn(unitItemMetadataService, 'removeItemMetadata')
        .mockResolvedValue(undefined);

      await controller.remove(metadataId);

      expect(unitItemMetadataService.removeItemMetadata).toHaveBeenCalledWith(metadataId);
      expect(unitItemMetadataService.removeItemMetadata).toHaveBeenCalledTimes(1);
    });

    it('should handle different metadata ids', async () => {
      const metadataId = 99;

      jest.spyOn(unitItemMetadataService, 'removeItemMetadata')
        .mockResolvedValue(undefined);

      await controller.remove(metadataId);

      expect(unitItemMetadataService.removeItemMetadata).toHaveBeenCalledWith(metadataId);
    });

    it('should handle removal of non-existent metadata', async () => {
      const metadataId = 999;

      jest.spyOn(unitItemMetadataService, 'removeItemMetadata')
        .mockResolvedValue(undefined);

      await controller.remove(metadataId);

      expect(unitItemMetadataService.removeItemMetadata).toHaveBeenCalledWith(metadataId);
    });
  });
});
