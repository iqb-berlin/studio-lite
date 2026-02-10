import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkspaceUserService } from './workspace-user.service';
import Workspace from '../entities/workspace.entity';
import WorkspaceUser from '../entities/workspace-user.entity';
import { UnitUserService } from './unit-user.service';

describe('WorkspaceUserService', () => {
  let service: WorkspaceUserService;
  let workspaceRepository: Repository<Workspace>;
  let workspaceUserRepository: Repository<WorkspaceUser>;
  let unitUserService: UnitUserService;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn()
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
  });
});
