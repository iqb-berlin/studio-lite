import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  Repository, Not, In, IsNull
} from 'typeorm';
import { UnitCommentDto, UpdateUnitCommentDto, UpdateUnitCommentVisibilityDto } from '@studio-lite-lib/api-dto';
import { createMock } from '@golevelup/ts-jest';
import { UnitCommentService } from './unit-comment.service';
import UnitComment from '../entities/unit-comment.entity';
import UnitCommentVote from '../entities/unit-comment-vote.entity';
import { ItemCommentService } from './item-comment.service';
import UnitCommentUnitItem from '../entities/unit-comment-unit-item.entity';
import { UnitCommentNotFoundException } from '../exceptions/unit-comment-not-found.exception';

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

  describe('findUnitIdsWithComments', () => {
    it('should answer which of the given units have comments', async () => {
      mockRepository.find.mockResolvedValue([{ unitId: 1 }, { unitId: 1 }, { unitId: 3 }] as UnitComment[]);

      const result = await service.findUnitIdsWithComments([1, 2, 3]);

      expect(result).toEqual(new Set([1, 3]));
      expect(repository.find).toHaveBeenCalledWith({
        where: { unitId: In([1, 2, 3]) },
        select: { unitId: true }
      });
    });

    it('should not query for an empty list', async () => {
      mockRepository.find.mockClear();

      expect(await service.findUnitIdsWithComments([])).toEqual(new Set());
      expect(repository.find).not.toHaveBeenCalled();
    });
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

  describe('the vote of the user', () => {
    it('should be none for a user who did not vote', async () => {
      mockRepository.find.mockResolvedValueOnce([{ id: 1, unitId: 1 }] as UnitComment[]);
      mockVoteRepository.find.mockResolvedValueOnce([{ commentId: 1, userId: 1, vote: 'up' }] as UnitCommentVote[]);
      mockItemCommentService.findUnitItemComments.mockResolvedValueOnce([]);

      const [comment] = await service.findOnesComments(1, 4);

      expect(comment.userVote).toBeNull();
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

  describe('isRootInUnit', () => {
    it('should ask for a root comment in the unit', async () => {
      mockRepository.exists.mockResolvedValue(true);

      expect(await service.isRootInUnit(42, 10)).toBe(true);
      expect(repository.exists).toHaveBeenLastCalledWith({ where: { id: 42, unitId: 10, parentId: IsNull() } });
    });
  });

  describe('createCommentAs', () => {
    const author = { id: 7, name: 'Muster, Max' };
    const forged = {
      body: 'test', unitId: 99, userId: 99, userName: 'someone else', hidden: false
    };

    beforeEach(() => {
      mockRepository.exists.mockClear();
      mockRepository.create.mockClear();
      (mockRepository.create as jest.Mock).mockImplementation(comment => ({ ...comment, id: 123 }));
      mockRepository.save.mockImplementation(async comment => comment as UnitComment);
    });

    it('should save the comment with the author and the unit given, whatever the body names', async () => {
      expect(await service.createCommentAs(author, 10, forged)).toBe(123);
      expect(repository.create).toHaveBeenCalledWith({
        body: 'test',
        parentId: null,
        hidden: false,
        unitId: 10,
        userId: 7,
        userName: 'Muster, Max',
        createdAt: expect.any(Date),
        changedAt: expect.any(Date)
      });
      expect(repository.exists).not.toHaveBeenCalled();
    });

    it('should leave out an id the body sends, so that no other comment is overwritten', async () => {
      const withId = { ...forged, id: 42 } as typeof forged;

      await service.createCommentAs(author, 10, withId);
      expect(repository.create).toHaveBeenCalledWith(expect.not.objectContaining({ id: 42 }));
    });

    it.each([null, undefined, 0])('should make a root comment for the parent %p', async parentId => {
      await service.createCommentAs(author, 10, { ...forged, parentId });
      expect(repository.exists).not.toHaveBeenCalled();
      expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({ parentId: null }));
    });

    it('should save a reply to a root comment of the same unit', async () => {
      mockRepository.exists.mockResolvedValue(true);

      expect(await service.createCommentAs(author, 10, { ...forged, parentId: 42 })).toBe(123);
      expect(repository.exists).toHaveBeenCalledWith({ where: { id: 42, unitId: 10, parentId: IsNull() } });
      expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({ parentId: 42 }));
    });

    it('should refuse a reply to a comment of another unit, or to a reply, with a 404', async () => {
      mockRepository.exists.mockResolvedValue(false);

      await expect(service.createCommentAs(author, 10, { ...forged, parentId: 42 }))
        .rejects.toThrow(UnitCommentNotFoundException);
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should refuse a parent that is no comment id without looking it up', async () => {
      const malformed = { ...forged, parentId: 'abc' as unknown as number };

      await expect(service.createCommentAs(author, 10, malformed)).rejects.toThrow(UnitCommentNotFoundException);
      expect(repository.exists).not.toHaveBeenCalled();
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('createComments', () => {
    // A copied reply hangs under the copy of its root, not under the root it was copied from (#1958).
    it('should hang each copied reply under the copy of its root', async () => {
      const comments = [
        { id: 1, parentId: null, body: 'Wurzel' } as UnitCommentDto,
        { id: 2, parentId: 1, body: 'Antwort' } as UnitCommentDto
      ];
      // the mocks of this file are shared by all its tests, so this one sets them only for its own calls
      const copy = (dto: Partial<UnitComment>) => ({ ...dto }) as UnitComment;
      const saveAs = (id: number) => (entity: UnitComment) => Promise.resolve(Object.assign(entity, { id }));
      mockRepository.create.mockImplementationOnce(copy).mockImplementationOnce(copy);
      mockRepository.save.mockImplementationOnce(saveAs(100)).mockImplementationOnce(saveAs(101));

      await service.createComments(comments, 5, []);

      expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({
        body: 'Wurzel', parentId: null, unitId: 5
      }));
      expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({
        body: 'Antwort', parentId: 100, unitId: 5
      }));
    });

    it('should link a copied comment to the copies of its items', async () => {
      mockRepository.create.mockImplementationOnce((dto: Partial<UnitComment>) => ({ ...dto }) as UnitComment);
      mockRepository.save.mockImplementationOnce(
        (entity: UnitComment) => Promise.resolve(Object.assign(entity, { id: 100 }))
      );
      mockItemCommentService.createCommentItemConnection.mockClear();

      await service.createComments(
        [{ id: 1, parentId: null, itemUuids: ['old-1'] } as UnitCommentDto],
        5,
        [{ oldUuid: 'old-1', newUuid: 'new-1' }]
      );

      expect(itemCommentService.createCommentItemConnection).toHaveBeenCalledWith(5, 'new-1', 100);
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

  it.each([
    ['patchCommentBody', () => service.patchCommentBody(9, { body: 'x' } as UpdateUnitCommentDto)],
    [
      'patchCommentVisibility',
      () => service.patchCommentVisibility(9, { hidden: true } as UpdateUnitCommentVisibilityDto)
    ]
  ])('%s should answer an unknown comment with not found', async (_, call) => {
    mockRepository.findOne.mockResolvedValueOnce(null);

    await expect(call()).rejects.toThrow(UnitCommentNotFoundException);
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
    // A review opened through its link and password carries user 0; its vote failed on the
    // foreign key to `user` (#1730).
    it('should refuse a vote without a user account', async () => {
      mockVoteRepository.save.mockClear();
      mockVoteRepository.delete.mockClear();
      await expect(service.toggleVote(1, 0, 'up')).rejects.toThrow(ForbiddenException);
      await expect(service.toggleVote(1, 0, null)).rejects.toThrow(ForbiddenException);
      expect(voteRepository.save).not.toHaveBeenCalled();
      expect(voteRepository.delete).not.toHaveBeenCalled();
    });

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
