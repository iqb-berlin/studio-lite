import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnitItemMetadataDto, UnitItemWithMetadataDto } from '@studio-lite-lib/api-dto';
import { UnitItemService } from './unit-item.service';
import UnitItem from '../entities/unit-item.entity';
import { UnitItemMetadataService } from './unit-item-metadata.service';
import { ItemCommentService } from './item-comment.service';

describe('UnitItemService', () => {
  let service: UnitItemService;
  let repository: Repository<UnitItem>;
  let unitItemMetadataService: UnitItemMetadataService;
  let itemCommentService: ItemCommentService;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  };

  const mockUnitItemMetadataService = {
    getAllByItemId: jest.fn(),
    updateItemMetadata: jest.fn(),
    removeItemMetadata: jest.fn(),
    addItemMetadata: jest.fn()
  };

  const mockItemCommentService = {
    findItemCommentsByUnitId: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnitItemService,
        {
          provide: getRepositoryToken(UnitItem),
          useValue: mockRepository
        },
        {
          provide: UnitItemMetadataService,
          useValue: mockUnitItemMetadataService
        },
        {
          provide: ItemCommentService,
          useValue: mockItemCommentService
        }
      ]
    }).compile();

    service = module.get<UnitItemService>(UnitItemService);
    repository = module.get<Repository<UnitItem>>(getRepositoryToken(UnitItem));
    unitItemMetadataService = module.get<UnitItemMetadataService>(UnitItemMetadataService);
    itemCommentService = module.get<ItemCommentService>(ItemCommentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAll', () => {
    it('should return all unit items', async () => {
      const items = [{ uuid: 'u1' }, { uuid: 'u2' }] as UnitItem[];
      mockRepository.find.mockResolvedValue(items);

      const result = await service.getAll();

      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual(items);
    });
  });

  describe('getAllByUnitId', () => {
    it('should return items', async () => {
      const unitId = 1;
      const items = [{ id: 1, unitId }] as unknown as UnitItem[];
      mockRepository.find.mockResolvedValue(items);

      const result = await service.getAllByUnitId(unitId);

      expect(repository.find).toHaveBeenCalledWith({ where: { unitId }, order: { id: 'ASC' } });
      expect(result).toEqual(items);
    });
  });

  describe('getOneByUuid', () => {
    it('should return item by uuid', async () => {
      const uuid = 'uuid-1';
      const item = { uuid } as UnitItem;
      mockRepository.findOneBy.mockResolvedValue(item);

      const result = await service.getOneByUuid(uuid);

      expect(repository.findOneBy).toHaveBeenCalledWith({ uuid });
      expect(result).toEqual(item);
    });
  });

  describe('getAllByUnitIdWithMetadata', () => {
    it('should return items with metadata', async () => {
      const unitId = 1;
      const items = [{ uuid: 'uuid-1' }] as UnitItem[];
      const metadata = [{ id: 1, unitItemUuid: 'uuid-1' }] as UnitItemMetadataDto[];

      mockRepository.find.mockResolvedValue(items);
      mockUnitItemMetadataService.getAllByItemId.mockResolvedValue(metadata);

      const result = await service.getAllByUnitIdWithMetadata(unitId);

      expect(result[0].profiles).toEqual(metadata);
    });
  });

  describe('updateItem', () => {
    it('should update item and sync metadata', async () => {
      const uuid = 'uuid-1';
      const inputItem = {
        uuid,
        profiles: [{ id: 1, unitItemUuid: uuid }]
      } as UnitItemWithMetadataDto;

      const existingItem = { uuid } as UnitItem;
      const existingProfiles = [{ id: 2, unitItemUuid: uuid }] as UnitItemMetadataDto[];

      mockRepository.findOneBy.mockResolvedValue(existingItem);
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockUnitItemMetadataService.getAllByItemId.mockResolvedValue(existingProfiles);

      await service.updateItem(uuid, inputItem);

      expect(repository.update).toHaveBeenCalled();
      expect(unitItemMetadataService.removeItemMetadata).toHaveBeenCalledWith(2);
      expect(unitItemMetadataService.updateItemMetadata).toHaveBeenCalled();
    });
  });

  describe('patchItemMetadataCurrentProfile', () => {
    it('should update current profile', async () => {
      const unitId = 1;
      const itemProfile = 'p1';
      const items = [{ uuid: 'u1' }] as UnitItem[];
      const metadata = [{ id: 1, profileId: 'p1' }, { id: 2, profileId: 'p2' }] as UnitItemMetadataDto[];

      mockRepository.find.mockResolvedValue(items);
      mockUnitItemMetadataService.getAllByItemId.mockResolvedValue(metadata);

      await service.patchItemMetadataCurrentProfile(unitId, itemProfile);

      expect(unitItemMetadataService.updateItemMetadata).toHaveBeenCalledTimes(2);
    });
  });

  describe('addItem', () => {
    it('should add item and metadata', async () => {
      const unitId = 1;
      const itemDto = { uuid: 'new-uuid', profiles: [{ id: 0 }] } as UnitItemWithMetadataDto;
      const savedItem = { ...itemDto, uuid: 'real-uuid' };

      mockRepository.create.mockReturnValue(savedItem);
      mockRepository.save.mockResolvedValue(savedItem);

      const result = await service.addItem(unitId, itemDto);

      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
      expect(unitItemMetadataService.addItemMetadata).toHaveBeenCalled();
      expect(result).toBe('real-uuid');
    });
  });

  describe('removeItem', () => {
    it('should delete item', async () => {
      const uuid = 'u1';
      mockRepository.delete.mockResolvedValue({ affected: 1 });
      await service.removeItem(uuid);
      expect(repository.delete).toHaveBeenCalledWith(uuid);
    });
  });

  describe('findItemCommentsByUnitId', () => {
    it('should proxy call to itemCommentService', async () => {
      const unitId = 1;
      await service.findItemCommentsByUnitId(unitId);
      expect(itemCommentService.findItemCommentsByUnitId).toHaveBeenCalledWith(unitId);
    });
  });

  describe('compare (static)', () => {
    it('should compare lists correctly', () => {
      const saved = [{ id: 1 }, { id: 2 }];
      const newer = [{ id: 1 }, { id: 3 }];
      const result = UnitItemService.compare(saved, newer, 'id');
      expect(result.removed).toEqual([{ id: 2 }]);
      expect(result.unchanged).toEqual([{ id: 1 }, { id: 3 }]);
      expect(result.added).toEqual([]);
    });
  });
});
