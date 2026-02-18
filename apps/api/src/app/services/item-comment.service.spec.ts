import { Test, TestingModule } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ItemCommentService } from './item-comment.service';
import UnitCommentUnitItem from '../entities/unit-comment-unit-item.entity';
import UnitComment from '../entities/unit-comment.entity';
import UnitItem from '../entities/unit-item.entity';
import { UnitCommentNotFoundException } from '../exceptions/unit-comment-not-found.exception';
import { UnitItemNotFoundException } from '../exceptions/unit-item-not-found.exception';

describe('ItemCommentService', () => {
  let service: ItemCommentService;
  let unitCommentUnitItemRepository: DeepMocked<Repository<UnitCommentUnitItem>>;
  let unitCommentsRepository: DeepMocked<Repository<UnitComment>>;
  let unitItemRepository: DeepMocked<Repository<UnitItem>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItemCommentService,
        {
          provide: getRepositoryToken(UnitCommentUnitItem),
          useValue: createMock<Repository<UnitCommentUnitItem>>()
        },
        {
          provide: getRepositoryToken(UnitComment),
          useValue: createMock<Repository<UnitComment>>()
        },
        {
          provide: getRepositoryToken(UnitItem),
          useValue: createMock<Repository<UnitItem>>()
        }
      ]
    }).compile();

    service = module.get<ItemCommentService>(ItemCommentService);
    unitCommentUnitItemRepository = module.get(getRepositoryToken(UnitCommentUnitItem));
    unitCommentsRepository = module.get(getRepositoryToken(UnitComment));
    unitItemRepository = module.get(getRepositoryToken(UnitItem));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findItemComments', () => {
    it('should return comments for item', async () => {
      const result = [];
      unitCommentUnitItemRepository.find.mockResolvedValue(result);
      expect(await service.findItemComments('uuid')).toBe(result);
      expect(unitCommentUnitItemRepository.find).toHaveBeenCalled();
    });
  });

  describe('findCommentItems', () => {
    it('should return items for comment', async () => {
      const result = [];
      unitCommentUnitItemRepository.find.mockResolvedValue(result);
      expect(await service.findCommentItems(1)).toBe(result);
      expect(unitCommentUnitItemRepository.find).toHaveBeenCalled();
    });
  });

  describe('createCommentItemConnection', () => {
    it('should throw exception if comment not found', async () => {
      unitCommentsRepository.findOne.mockResolvedValue(null);
      await expect(service.createCommentItemConnection(1, 'uuid', 1))
        .rejects.toThrow(UnitCommentNotFoundException);
    });

    it('should throw exception if item not found', async () => {
      unitCommentsRepository.findOne.mockResolvedValue(new UnitComment());
      unitItemRepository.findOne.mockResolvedValue(null);
      await expect(service.createCommentItemConnection(1, 'uuid', 1))
        .rejects.toThrow(UnitItemNotFoundException);
    });

    it('should return commentId if connection already exists', async () => {
      unitCommentsRepository.findOne.mockResolvedValue(new UnitComment());
      unitItemRepository.findOne.mockResolvedValue(new UnitItem());
      unitCommentUnitItemRepository.findOne.mockResolvedValue(new UnitCommentUnitItem());

      const result = await service.createCommentItemConnection(1, 'uuid', 1);
      expect(result).toBe(1);
    });

    it('should create new connection', async () => {
      unitCommentsRepository.findOne.mockResolvedValue(new UnitComment());
      unitItemRepository.findOne.mockResolvedValue(new UnitItem());
      unitCommentUnitItemRepository.findOne.mockResolvedValue(null);
      unitCommentUnitItemRepository.create.mockReturnValue(new UnitCommentUnitItem());

      const result = await service.createCommentItemConnection(1, 'uuid', 1);
      expect(result).toBe(1);
      expect(unitCommentUnitItemRepository.save).toHaveBeenCalled();
    });
  });

  describe('removeCommentItemConnection', () => {
    it('should delete connection', async () => {
      await service.removeCommentItemConnection('uuid', 1);
      expect(unitCommentUnitItemRepository.delete).toHaveBeenCalledWith({
        unitCommentId: 1,
        unitItemUuid: 'uuid'
      });
    });
  });

  describe('findItemCommentsByUnitId', () => {
    it('should return comments for unit', async () => {
      const result = [];
      unitCommentUnitItemRepository.find.mockResolvedValue(result);
      expect(await service.findItemCommentsByUnitId(1)).toBe(result);
    });
  });

  describe('findUnitItemComments', () => {
    it('should return comments for unit and comment', async () => {
      const result = [];
      unitCommentUnitItemRepository.find.mockResolvedValue(result);
      expect(await service.findUnitItemComments(1, 1)).toBe(result);
    });
  });

  describe('compare', () => {
    it('should return unchanged, removed, added', () => {
      const savedItems = [
        { unitItemUuid: '1' },
        { unitItemUuid: '2' }
      ] as UnitCommentUnitItem[];
      const newUuids = ['2', '3'];

      const result = ItemCommentService.compare(savedItems, newUuids);
      expect(result.unchanged).toEqual(['2']);
      expect(result.removed).toEqual(['1']);
      expect(result.added).toEqual(['3']);
    });
  });

  describe('updateCommentItems', () => {
    it('should handle removals and additions', async () => {
      const savedItems = [
        { unitItemUuid: '1' },
        { unitItemUuid: '2' }
      ] as UnitCommentUnitItem[];

      unitCommentUnitItemRepository.find.mockResolvedValue(savedItems);

      // mocks for creating/removing connections
      // using spyOn on service instance is tricky because methods are async and we are inside test
      // but we can mock repository methods called by create/remove

      // However, createCommentItemConnection and removeCommentItemConnection are public methods of the service.
      // To test updateCommentItems, we should ideally spy on these methods.

      const removeSpy = jest.spyOn(service, 'removeCommentItemConnection').mockResolvedValue(undefined);
      const createSpy = jest.spyOn(service, 'createCommentItemConnection').mockResolvedValue(1);

      await service.updateCommentItems(1, 1, ['2', '3']);

      expect(removeSpy).toHaveBeenCalledWith('1', 1);
      expect(createSpy).toHaveBeenCalledWith(1, '3', 1);
    });
  });
});
