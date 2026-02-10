import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnitCommentDto, UpdateUnitCommentDto, UpdateUnitCommentVisibilityDto } from '@studio-lite-lib/api-dto';
import { UnitCommentService } from './unit-comment.service';
import UnitComment from '../entities/unit-comment.entity';
import { ItemCommentService } from './item-comment.service';

describe('UnitCommentService', () => {
  let service: UnitCommentService;
  let repository: Repository<UnitComment>;
  let itemCommentService: ItemCommentService;

  const mockRepository = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    findOneBy: jest.fn(),
    findOne: jest.fn()
  };

  const mockItemCommentService = {
    findUnitItemComments: jest.fn(),
    createCommentItemConnection: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnitCommentService,
        {
          provide: getRepositoryToken(UnitComment),
          useValue: mockRepository
        },
        {
          provide: ItemCommentService,
          useValue: mockItemCommentService
        }
      ]
    }).compile();

    service = module.get<UnitCommentService>(UnitCommentService);
    repository = module.get<Repository<UnitComment>>(getRepositoryToken(UnitComment));
    itemCommentService = module.get<ItemCommentService>(ItemCommentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOnesComments', () => {
    it('should return comments with itemUuids', async () => {
      const unitId = 1;
      const comments = [{ id: 1, body: 'test', unitId }] as UnitComment[];
      const itemComments = [{ unitItemUuid: 'uuid-1' }];

      mockRepository.find.mockResolvedValue(comments);
      mockItemCommentService.findUnitItemComments.mockResolvedValue(itemComments);

      const result = await service.findOnesComments(unitId);

      expect(repository.find).toHaveBeenCalledWith({
        where: { unitId },
        order: { createdAt: 'ASC' }
      });
      expect(itemCommentService.findUnitItemComments).toHaveBeenCalledWith(unitId, 1);
      expect(result).toEqual([
        {
          ...comments[0],
          itemUuids: ['uuid-1']
        }
      ]);
    });
  });

  describe('copyComments', () => {
    it('should copy comments from old unit to new unit', async () => {
      const oldUnitId = 1;
      const newUnitId = 2;
      const itemUuidLookups = [];
      const comments = [{
        id: 1, body: 'test', unitId: oldUnitId, parentId: null
      }] as UnitComment[];
      const itemComments = [];

      // Mock findOnesComments internally calling find and findUnitItemComments
      mockRepository.find.mockResolvedValue(comments);
      mockItemCommentService.findUnitItemComments.mockResolvedValue(itemComments);

      mockRepository.create.mockImplementation(dto => ({ ...dto, id: 100 }));
      mockRepository.save.mockResolvedValue({ id: 100 });

      await service.copyComments(oldUnitId, newUnitId, itemUuidLookups);

      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe('createCommentConnections', () => {
    it('should create comment connections', async () => {
      const unitId = 1;
      const commentId = 10;
      const commentItemUuids = ['old-uuid-1'];
      const itemUuidLookups = [{ oldUuid: 'old-uuid-1', newUuid: 'new-uuid-1' }];

      mockItemCommentService.createCommentItemConnection.mockResolvedValue(1);

      const result = await service.createCommentConnections(commentId, unitId, commentItemUuids, itemUuidLookups);

      expect(itemCommentService.createCommentItemConnection).toHaveBeenCalledWith(unitId, 'new-uuid-1', commentId);
      expect(result).toEqual([1]);
    });
  });

  describe('findOnesLastChangedComment', () => {
    it('should return last changed comment', async () => {
      const unitId = 1;
      const comments = [{ id: 1, changedAt: new Date() }] as UnitComment[];
      mockRepository.find.mockResolvedValue(comments);

      const result = await service.findOnesLastChangedComment(unitId);

      expect(repository.find).toHaveBeenCalledWith({
        where: { unitId },
        order: { changedAt: 'DESC' }
      });
      expect(result).toEqual(comments[0]);
    });

    it('should return null if no comments', async () => {
      mockRepository.find.mockResolvedValue([]);
      const result = await service.findOnesLastChangedComment(1);
      expect(result).toBeNull();
    });
  });

  describe('createComment', () => {
    it('should create a comment', async () => {
      const dto = { unitId: 1, body: 'test' } as UnitCommentDto;
      const savedEntity = {
        ...dto, id: 123, createdAt: new Date(), changedAt: new Date()
      };

      mockRepository.create.mockReturnValue(savedEntity);
      mockRepository.save.mockResolvedValue(savedEntity);

      const result = await service.createComment(dto);

      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalledWith(savedEntity);
      expect(result).toBe(123);
    });
  });

  describe('createComments', () => {
    it('should create comments recursively', async () => {
      const unitId = 1;
      const itemUuids = [];
      const comments = [
        { id: 1, parentId: null } as UnitCommentDto,
        { id: 2, parentId: 1 } as UnitCommentDto
      ];

      mockRepository.create.mockImplementation(dto => ({ ...dto, id: Math.random() }));
      mockRepository.save.mockImplementation(entity => Promise.resolve(entity));

      await service.createComments(comments, unitId, itemUuids);

      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe('removeComment', () => {
    it('should remove comment and its children', async () => {
      const id = 1;
      const children = [{ id: 2 }, { id: 3 }] as UnitComment[];

      mockRepository.find.mockResolvedValue(children);
      mockRepository.delete.mockResolvedValue({ affected: 3 });

      await service.removeComment(id);

      expect(repository.find).toHaveBeenCalledWith({
        where: { parentId: id },
        select: { id: true }
      });
      expect(repository.delete).toHaveBeenCalledWith([1, 2, 3]);
    });
  });

  describe('findOneComment', () => {
    it('should return comment if found', async () => {
      const id = 1;
      const comment = { id } as UnitComment;
      mockRepository.findOne.mockResolvedValue(comment);

      const result = await service.findOneComment(id);
      expect(result).toEqual(comment);
    });

    it('should throw exception if not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.findOneComment(1)).rejects.toThrow();
    });
  });

  describe('patchCommentBody', () => {
    it('should update body', async () => {
      const id = 1;
      const comment = { id, body: 'old' } as UnitComment;
      mockRepository.findOne.mockResolvedValue(comment);

      await service.patchCommentBody(id, { body: 'new', userId: 1 } as UpdateUnitCommentDto);

      expect(comment.body).toBe('new');
      expect(repository.save).toHaveBeenCalledWith(comment);
    });
  });

  describe('patchCommentVisibility', () => {
    it('should update visibility', async () => {
      const id = 1;
      const comment = { id, hidden: false } as UnitComment;
      mockRepository.findOne.mockResolvedValue(comment);

      await service.patchCommentVisibility(id, { hidden: true, userId: 1 } as UpdateUnitCommentVisibilityDto);

      expect(comment.hidden).toBe(true);
      expect(repository.save).toHaveBeenCalledWith(comment);
    });
  });
});
