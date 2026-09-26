import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ADMIN_IMPLICIT_ACCESS_LEVEL, WorkspaceUserService } from './workspace-user.service';
import Workspace from '../entities/workspace.entity';
import WorkspaceUser from '../entities/workspace-user.entity';
import User from '../entities/user.entity';
import { UnitUserService } from './unit-user.service';

describe('WorkspaceUserService', () => {
  let service: WorkspaceUserService;
  let workspaceRepository: Repository<Workspace>;
  let workspaceUserRepository: Repository<WorkspaceUser>;
  let unitUserService: UnitUserService;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    exists: jest.fn(),
    delete: jest.fn()
  };

  // Whether the user is an administrator; plain users unless a test says otherwise.
  const mockUsersRepository = {
    exists: jest.fn().mockResolvedValue(false)
  };

  const mockUnitUserService = {
    deleteUnitUsersByWorkspaceId: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceUserService,
        {
          provide: getRepositoryToken(Workspace),
          useValue: mockRepository
        },
        {
          provide: getRepositoryToken(WorkspaceUser),
          useValue: mockRepository
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUsersRepository
        },
        {
          provide: UnitUserService,
          useValue: mockUnitUserService
        }
      ]
    }).compile();

    service = module.get<WorkspaceUserService>(WorkspaceUserService);
    workspaceRepository = module.get<Repository<Workspace>>(getRepositoryToken(Workspace));
    workspaceUserRepository = module.get<Repository<WorkspaceUser>>(getRepositoryToken(WorkspaceUser));
    unitUserService = module.get<UnitUserService>(UnitUserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockUsersRepository.exists.mockResolvedValue(false);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('deleteAllByWorkspaceGroup', () => {
    it('should delete workspace users for all workspaces in group', async () => {
      const workspaceGroupId = 1;
      const userId = 2;
      const workspaces = [{ id: 10 }] as Workspace[];

      mockRepository.find.mockResolvedValue(workspaces);

      await service.deleteAllByWorkspaceGroup(workspaceGroupId, userId);

      expect(workspaceRepository.find).toHaveBeenCalledWith({
        where: { groupId: workspaceGroupId }, select: { id: true }
      });
      expect(workspaceUserRepository.delete).toHaveBeenCalledWith({ userId, workspaceId: 10 });
      expect(unitUserService.deleteUnitUsersByWorkspaceId).toHaveBeenCalledWith(10, userId);
    });
  });

  describe('access checks', () => {
    const userId = 1;
    const workspaceId = 2;

    it('hasAccess', async () => {
      mockRepository.findOne.mockResolvedValue({ userId } as WorkspaceUser);
      expect(await service.hasAccess(userId, workspaceId)).toBe(true);
    });

    it('hasAccessToWorkspaceGroup asks for an assignment to any workspace of the group', async () => {
      mockRepository.exists.mockResolvedValue(true);
      expect(await service.hasAccessToWorkspaceGroup(userId, 7)).toBe(true);
      expect(workspaceUserRepository.exists).toHaveBeenCalledWith({
        where: { userId, workspace: { groupId: 7 } }
      });

      mockRepository.exists.mockResolvedValue(false);
      expect(await service.hasAccessToWorkspaceGroup(userId, 7)).toBe(false);
    });

    it('canComment', async () => {
      mockRepository.findOne.mockResolvedValue({ accessLevel: 1 } as WorkspaceUser);
      expect(await service.canComment(userId, workspaceId)).toBe(true);

      mockRepository.findOne.mockResolvedValue({ accessLevel: 0 } as WorkspaceUser);
      expect(await service.canComment(userId, workspaceId)).toBe(false);
    });

    it('canWrite', async () => {
      mockRepository.findOne.mockResolvedValue({ accessLevel: 2 } as WorkspaceUser);
      expect(await service.canWrite(userId, workspaceId)).toBe(true);

      mockRepository.findOne.mockResolvedValue({ accessLevel: 1 } as WorkspaceUser);
      expect(await service.canWrite(userId, workspaceId)).toBe(false);
    });

    it('canManage', async () => {
      mockRepository.findOne.mockResolvedValue({ accessLevel: 3 } as WorkspaceUser);
      expect(await service.canManage(userId, workspaceId)).toBe(true);

      mockRepository.findOne.mockResolvedValue({ accessLevel: 2 } as WorkspaceUser);
      expect(await service.canManage(userId, workspaceId)).toBe(false);
    });

    it('canDelete', async () => {
      mockRepository.findOne.mockResolvedValue({ accessLevel: 4 } as WorkspaceUser);
      expect(await service.canDelete(userId, workspaceId)).toBe(true);

      mockRepository.findOne.mockResolvedValue({ accessLevel: 3 } as WorkspaceUser);
      expect(await service.canDelete(userId, workspaceId)).toBe(false);
    });

    it('should refuse an unassigned user who is no administrator', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      expect(await service.accessLevel(userId, workspaceId)).toBeNull();
      expect(await service.hasAccess(userId, workspaceId)).toBe(false);
      expect(await service.canComment(userId, workspaceId)).toBe(false);
    });
  });

  // System administrators open every unit without an individual assignment, and none is written
  // for it -- a row would list them among the workspace's users (#1571).
  describe('an administrator', () => {
    const adminId = 5;
    const workspaceId = 2;

    beforeEach(() => {
      mockUsersRepository.exists.mockResolvedValue(true);
      // the workspace exists
      mockRepository.exists.mockResolvedValue(true);
    });

    it('should hold the implicit commenter level in a workspace they are not assigned to', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      expect(ADMIN_IMPLICIT_ACCESS_LEVEL).toBe(1);
      expect(await service.accessLevel(adminId, workspaceId)).toBe(ADMIN_IMPLICIT_ACCESS_LEVEL);
      expect(await service.hasAccess(adminId, workspaceId)).toBe(true);
      expect(await service.canComment(adminId, workspaceId)).toBe(true);
      expect(mockUsersRepository.exists).toHaveBeenCalledWith({ where: { id: adminId, isAdmin: true } });
      expect(workspaceRepository.exists).toHaveBeenCalledWith({ where: { id: workspaceId } });
    });

    // Without this an administrator passed the guards for any made-up workspace id, and the unit
    // routes, which do not check that a unit belongs to the workspace, answered with its data.
    it('should hold no level in a workspace that does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.exists.mockResolvedValue(false);

      expect(await service.accessLevel(adminId, 9988)).toBeNull();
      expect(await service.hasAccess(adminId, 9988)).toBe(false);
    });

    it('should keep a higher level assigned explicitly', async () => {
      mockRepository.findOne.mockResolvedValue({ accessLevel: 3 } as WorkspaceUser);

      expect(await service.accessLevel(adminId, workspaceId)).toBe(3);
      expect(await service.canManage(adminId, workspaceId)).toBe(true);
    });

    it('should be raised to the implicit level from a lower assigned one', async () => {
      mockRepository.findOne.mockResolvedValue({ accessLevel: 0 } as WorkspaceUser);

      expect(await service.accessLevel(adminId, workspaceId)).toBe(ADMIN_IMPLICIT_ACCESS_LEVEL);
      expect(await service.canComment(adminId, workspaceId)).toBe(true);
    });

    it('should not write, manage or delete without an assignment that allows it', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      expect(await service.canWrite(adminId, workspaceId)).toBe(false);
      expect(await service.canManage(adminId, workspaceId)).toBe(false);
      expect(await service.canDelete(adminId, workspaceId)).toBe(false);
    });

    it('should never be asked about a missing user id, which is a review session', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      expect(await service.accessLevel(0, workspaceId)).toBeNull();
      expect(mockUsersRepository.exists).not.toHaveBeenCalled();
    });
  });
});
