import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, Not, In } from 'typeorm';
import { UnitCommentDto, UpdateUnitCommentDto, UpdateUnitCommentVisibilityDto } from '@studio-lite-lib/api-dto';
import { createMock } from '@golevelup/ts-jest';
import { UnitCommentService } from './unit-comment.service';
import UnitComment from '../entities/unit-comment.entity';
import UnitCommentVote from '../entities/unit-comment-vote.entity';
import { ItemCommentService } from './item-comment.service';
import UnitCommentUnitItem from '../entities/unit-comment-unit-item.entity';

describe('UnitCommentService', () => {
  let service: UnitCommentService;
  let repository: Repository<UnitComment>;
  let voteRepository: Repository<UnitCommentVote>;
  let itemCommentService: ItemCommentService;

  const mockRepository = createMock<Repository<UnitComment>>();
  const mockVoteRepository = createMock<Repository<UnitCommentVote>>();
  const mockItemCommentService = createMock<ItemCommentService>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnitCommentService,
        {
          provide: getRepositoryToken(UnitComment),
          useValue: mockRepository
        },
        {
          provide: getRepositoryToken(UnitCommentVote),
          useValue: mockVoteRepository
        },
        {
          provide: ItemCommentService,
          useValue: mockItemCommentService
        }
      ]
    }).compile();

    service = module.get<UnitCommentService>(UnitCommentService);
    repository = module.get<Repository<UnitComment>>(getRepositoryToken(UnitComment));
    voteRepository = module.get<Repository<UnitCommentVote>>(getRepositoryToken(UnitCommentVote));
    itemCommentService = module.get<ItemCommentService>(ItemCommentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOnesComments', () => {
    it('should return comments with itemUuids and vote counts', async () => {
      const unitId = 1;
      const comments = [{ id: 1, body: 'test', unitId }] as UnitComment[];
      const itemComments = [{
        unitItemUuid: 'uuid-1', unitCommentId: 1, unitId: 1, createdAt: new Date(), changedAt: new Date()
      }];
      const votes = [
        { commentId: 1, userId: 1, vote: 'up' },
        { commentId: 1, userId: 2, vote: 'up' },
        { commentId: 1, userId: 3, vote: 'down' }
      ] as UnitCommentVote[];

      mockRepository.find.mockResolvedValue(comments);
      mockVoteRepository.find.mockResolvedValue(votes);
      mockItemCommentService.findUnitItemComments.mockResolvedValue(itemComments as UnitCommentUnitItem[]);

      const result = await service.findOnesComments(unitId, 1);

      expect(repository.find).toHaveBeenCalledWith({
        where: { unitId },
        order: { createdAt: 'ASC' }
      });
      expect(voteRepository.find).toHaveBeenCalledWith({
        where: { commentId: In([1]) }
      });
      expect(itemCommentService.findUnitItemComments).toHaveBeenCalledWith(unitId, 1);
      expect(result).toEqual([
        {
          ...comments[0],
          itemUuids: ['uuid-1'],
          upVotes: 2,
          downVotes: 1,
          userVote: 'up'
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
      mockItemCommentService.findUnitItemComments.mockResolvedValue(itemComments as UnitCommentUnitItem[]);

      (mockRepository.create as jest.Mock).mockImplementation(dto => ({ ...dto, id: 100 }));
      mockRepository.save.mockResolvedValue({ id: 100 } as UnitComment);

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

    it('should exclude user if excludeUserId is provided', async () => {
      const unitId = 1;
      const excludeUserId = 2;
      const comments = [{ id: 1, changedAt: new Date() }] as UnitComment[];
      mockRepository.find.mockResolvedValue(comments);

      const result = await service.findOnesLastChangedComment(unitId, excludeUserId);

      expect(repository.find).toHaveBeenCalledWith({
        where: { unitId, userId: Not(excludeUserId) },
        order: { changedAt: 'DESC' }
      });
      expect(result).toEqual(comments[0]);
    });
  });

  describe('createComment', () => {
    it('should create a comment', async () => {
      const dto = { unitId: 1, body: 'test' } as UnitCommentDto;
      const savedEntity = {
        ...dto, id: 123, createdAt: new Date(), changedAt: new Date()
      };

      (mockRepository.create as jest.Mock).mockReturnValue(savedEntity as UnitComment);
      mockRepository.save.mockResolvedValue(savedEntity as UnitComment);

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

      mockRepository.create.mockImplementation(dto => ({ ...dto, id: Math.random() }) as UnitComment);
      mockRepository.save.mockImplementation(entity => Promise.resolve(entity) as Promise<UnitComment>);

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
      mockRepository.delete.mockResolvedValue({ affected: 3, raw: [] });

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

  describe('toggleVote', () => {
    it('should delete vote if vote is null', async () => {
      const commentId = 1;
      const userId = 1;
      await service.toggleVote(commentId, userId, null);
      expect(voteRepository.delete).toHaveBeenCalledWith({ commentId, userId });
    });

    it('should update existing vote', async () => {
      const commentId = 1;
      const userId = 1;
      const existingVote = { commentId, userId, vote: 'up' } as UnitCommentVote;
      mockVoteRepository.findOne.mockResolvedValue(existingVote);

      await service.toggleVote(commentId, userId, 'down');

      expect(voteRepository.findOne).toHaveBeenCalledWith({ where: { commentId, userId } });
      expect(existingVote.vote).toBe('down');
      expect(voteRepository.save).toHaveBeenCalledWith(existingVote);
    });

    it('should create new vote if not exists', async () => {
      const commentId = 1;
      const userId = 1;
      mockVoteRepository.findOne.mockResolvedValue(null);
      mockVoteRepository.create.mockReturnValue({ commentId, userId, vote: 'up' } as UnitCommentVote);

      await service.toggleVote(commentId, userId, 'up');

      expect(voteRepository.create).toHaveBeenCalledWith({ commentId, userId, vote: 'up' });
      expect(voteRepository.save).toHaveBeenCalled();
    });
  });

  describe('getCommentVoters', () => {
    it('should return mapped voters from raw query', async () => {
      const commentId = 1;
      const mockVotes = [
        {
          vote: 'up',
          user: {
            firstName: 'John', lastName: 'Doe', name: 'jdoe'
          }
        },
        {
          vote: 'down',
          user: {
            firstName: '', lastName: '', name: 'user2'
          }
        }
      ] as unknown as UnitCommentVote[];

      mockVoteRepository.find.mockResolvedValue(mockVotes);

      const result = await service.getCommentVoters(commentId);

      expect(voteRepository.find).toHaveBeenCalledWith({
        where: { commentId },
        relations: ['user'],
        order: {
          user: {
            lastName: 'ASC',
            firstName: 'ASC'
          }
        }
      });
      expect(result).toEqual([
        { userName: 'Doe, John', vote: 'up' },
        { userName: 'user2', vote: 'down' }
      ]);
    });
  });
});
