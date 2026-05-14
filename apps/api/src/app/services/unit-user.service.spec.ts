import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUnitUserDto, UnitCommentDto } from '@studio-lite-lib/api-dto';
import { createMock } from '@golevelup/ts-jest';
import { UnitUserService } from './unit-user.service';
import UnitUser from '../entities/unit-user.entity';
import Unit from '../entities/unit.entity';
import { UnitCommentService } from './unit-comment.service';

describe('UnitUserService', () => {
  let service: UnitUserService;
  let unitUserRepository: Repository<UnitUser>;
  let unitRepository: Repository<Unit>;

  const mockUnitUserRepository = createMock<Repository<UnitUser>>();
  const mockUnitRepository = createMock<Repository<Unit>>();
  const mockUnitCommentService = createMock<UnitCommentService>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnitUserService,
        {
          provide: getRepositoryToken(UnitUser),
          useValue: mockUnitUserRepository
        },
        {
          provide: getRepositoryToken(Unit),
          useValue: mockUnitRepository
        },
        {
          provide: UnitCommentService,
          useValue: mockUnitCommentService
        }
      ]
    }).compile();

    service = module.get<UnitUserService>(UnitUserService);
    unitUserRepository = module.get<Repository<UnitUser>>(getRepositoryToken(UnitUser));
    unitRepository = module.get<Repository<Unit>>(getRepositoryToken(Unit));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUnitUser', () => {
    it('should create and save a unit user with latest comment timestamp', async () => {
      const userId = 1;
      const unitId = 2;
      const date = new Date();
      const createdEntity = { userId, unitId, lastSeenCommentChangedAt: date } as UnitUser;

      mockUnitCommentService.findOnesLastChangedComment.mockResolvedValue(
        { changedAt: date } as UnitCommentDto
      );
      (mockUnitUserRepository.create as jest.Mock).mockReturnValue(createdEntity);
      mockUnitUserRepository.save.mockResolvedValue(createdEntity);

      await service.createUnitUser(userId, unitId);

      expect(mockUnitCommentService.findOnesLastChangedComment).toHaveBeenCalledWith(unitId);
      expect(unitUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId, unitId, lastSeenCommentChangedAt: date })
      );
      expect(unitUserRepository.save).toHaveBeenCalledWith(createdEntity);
    });

    it('should create and save a unit user with current timestamp if no comments', async () => {
      const userId = 1;
      const unitId = 2;

      mockUnitCommentService.findOnesLastChangedComment.mockResolvedValue(null);
      (mockUnitUserRepository.create as jest.Mock).mockReturnValue({} as UnitUser);
      mockUnitUserRepository.save.mockResolvedValue({} as UnitUser);

      await service.createUnitUser(userId, unitId);

      expect(mockUnitCommentService.findOnesLastChangedComment).toHaveBeenCalledWith(unitId);
      expect(unitUserRepository.create).toHaveBeenCalledWith(expect.objectContaining({ userId, unitId }));
      expect(unitUserRepository.save).toHaveBeenCalled();
    });
  });

  describe('findLastSeenCommentTimestamp', () => {
    it('should return timestamp if unit user exists', async () => {
      const userId = 1;
      const unitId = 2;
      const date = new Date();
      const unitUser = { userId, unitId, lastSeenCommentChangedAt: date } as UnitUser;

      mockUnitUserRepository.findOne.mockResolvedValue(unitUser);

      const result = await service.findLastSeenCommentTimestamp(userId, unitId);

      expect(unitUserRepository.findOne).toHaveBeenCalledWith({ where: { userId, unitId } });
      expect(result).toEqual(date);
    });

    it('should return default timestamp if unit user does not exist', async () => {
      mockUnitUserRepository.findOne.mockResolvedValue(null);

      const before = new Date().getTime();
      const result = await service.findLastSeenCommentTimestamp(1, 2);
      const after = new Date().getTime();

      expect(result.getTime()).toBeGreaterThanOrEqual(before);
      expect(result.getTime()).toBeLessThanOrEqual(after);
    });
  });

  describe('patchUnitUserCommentsLastSeen', () => {
    it('should update timestamp if unit user exists', async () => {
      const unitId = 2;
      const date = new Date();
      const updateDto: UpdateUnitUserDto = { userId: 1, lastSeenCommentChangedAt: date };
      const unitUser = { userId: 1, unitId, lastSeenCommentChangedAt: new Date(2000, 1) } as UnitUser;

      mockUnitUserRepository.findOne.mockResolvedValue(unitUser);
      mockUnitUserRepository.save.mockResolvedValue({ ...unitUser, lastSeenCommentChangedAt: date });

      await service.patchUnitUserCommentsLastSeen(unitId, updateDto);

      expect(unitUserRepository.save).toHaveBeenCalledWith(expect.objectContaining({ lastSeenCommentChangedAt: date }));
    });

    it('should do nothing if unit user does not exist', async () => {
      mockUnitUserRepository.findOne.mockResolvedValue(null);
      await service.patchUnitUserCommentsLastSeen(2, { userId: 1, lastSeenCommentChangedAt: new Date() });
      expect(unitUserRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('deleteUnitUsersByWorkspaceId', () => {
    it('should delete unit users for all units in workspace', async () => {
      const workspaceId = 1;
      const userId = 10;
      const units = [{ id: 101 }, { id: 102 }] as Unit[];
      const unitUser1 = { userId, unitId: 101 } as UnitUser;

      mockUnitRepository.find.mockResolvedValue(units);
      mockUnitUserRepository.findOne
        .mockResolvedValueOnce(unitUser1) // Found for unit 101
        .mockResolvedValueOnce(null); // Not found for unit 102

      mockUnitUserRepository.delete.mockResolvedValue({ affected: 1, raw: [] });

      await service.deleteUnitUsersByWorkspaceId(workspaceId, userId);

      expect(unitRepository.find).toHaveBeenCalledWith({ where: { workspaceId } });
      expect(unitUserRepository.delete).toHaveBeenCalledWith(unitUser1);
      expect(unitUserRepository.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe('findByUnitId', () => {
    it('should return unit users', async () => {
      const unitId = 1;
      const unitUsers = [{ userId: 1, unitId }] as UnitUser[];
      mockUnitUserRepository.find.mockResolvedValue(unitUsers);

      const result = await service.findByUnitId(unitId);

      expect(unitUserRepository.find).toHaveBeenCalledWith({ where: { unitId } });
      expect(result).toEqual(unitUsers);
    });
  });
});
