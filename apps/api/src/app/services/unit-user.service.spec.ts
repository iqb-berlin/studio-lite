import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUnitUserDto } from '@studio-lite-lib/api-dto';
import { UnitUserService } from './unit-user.service';
import UnitUser from '../entities/unit-user.entity';
import Unit from '../entities/unit.entity';

describe('UnitUserService', () => {
  let service: UnitUserService;
  let unitUserRepository: Repository<UnitUser>;
  let unitRepository: Repository<Unit>;

  const mockUnitUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    find: jest.fn()
  };

  const mockUnitRepository = {
    find: jest.fn()
  };

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
    it('should create and save a unit user', async () => {
      const userId = 1;
      const unitId = 2;
      const createdEntity = { userId, unitId, lastSeenCommentChangedAt: new Date() } as UnitUser;

      mockUnitUserRepository.create.mockReturnValue(createdEntity);
      mockUnitUserRepository.save.mockResolvedValue(createdEntity);

      await service.createUnitUser(userId, unitId);

      expect(unitUserRepository.create).toHaveBeenCalledWith(expect.objectContaining({ userId, unitId }));
      expect(unitUserRepository.save).toHaveBeenCalledWith(createdEntity);
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
      const defaultDate = new Date(2022, 6);

      const result = await service.findLastSeenCommentTimestamp(1, 2);

      expect(result).toEqual(defaultDate);
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

      mockUnitUserRepository.delete.mockResolvedValue({ affected: 1 });

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
