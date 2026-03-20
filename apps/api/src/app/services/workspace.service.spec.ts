import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateWorkspaceDto, UserWorkspaceAccessDto, WorkspaceSettingsDto } from '@studio-lite-lib/api-dto';
import { WorkspaceService } from './workspace.service';
import Workspace from '../entities/workspace.entity';
import WorkspaceUser from '../entities/workspace-user.entity';
import WorkspaceGroup from '../entities/workspace-group.entity';
import WorkspaceGroupAdmin from '../entities/workspace-group-admin.entity';
import Unit from '../entities/unit.entity';
import { WorkspaceUserService } from './workspace-user.service';
import { UsersService } from './users.service';
import { UnitService } from './unit.service';
import { UnitUserService } from './unit-user.service';
import { UnitCommentService } from './unit-comment.service';
import User from '../entities/user.entity';
import { FileIo } from '../interfaces/file-io.interface';

describe('WorkspaceService', () => {
  let service: WorkspaceService;
  let workspaceRepository: Repository<Workspace>;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    update: jest.fn()
  };

  const mockWorkspaceUserService = {
    deleteAllByWorkspaceGroup: jest.fn()
  };

  const mockUsersService = {
    getUserIsAdmin: jest.fn(),
    isWorkspaceGroupAdmin: jest.fn()
  };

  const mockUnitService = {
    findAllForWorkspace: jest.fn(),
    findAllWithProperties: jest.fn(),
    create: jest.fn(),
    patchUnitProperties: jest.fn(),
    copyItemsWithMetadata: jest.fn(),
    getUnitIdsByWorkspaceId: jest.fn(),
    patchMetadataCurrentProfile: jest.fn(),
    removeUnitState: jest.fn()
  };

  const mockUnitUserService = {
    createUnitUser: jest.fn()
  };

  const mockUnitCommentService = {
    createComments: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceService,
        { provide: getRepositoryToken(Workspace), useValue: mockRepository },
        { provide: getRepositoryToken(WorkspaceUser), useValue: mockRepository },
        { provide: getRepositoryToken(WorkspaceGroup), useValue: mockRepository },
        { provide: getRepositoryToken(WorkspaceGroupAdmin), useValue: mockRepository },
        { provide: getRepositoryToken(Unit), useValue: mockRepository },
        { provide: WorkspaceUserService, useValue: mockWorkspaceUserService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: UnitService, useValue: mockUnitService },
        { provide: UnitUserService, useValue: mockUnitUserService },
        { provide: UnitCommentService, useValue: mockUnitCommentService }
      ]
    }).compile();

    service = module.get<WorkspaceService>(WorkspaceService);
    workspaceRepository = module.get<Repository<Workspace>>(getRepositoryToken(Workspace));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllWorkspaces', () => {
    it('should return all', async () => {
      mockRepository.find.mockResolvedValue([]);
      await service.getAllWorkspaces();
      expect(workspaceRepository.find).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return workspaces for user', async () => {
      const userId = 1;
      const wsUser = [{ workspaceId: 1, accessLevel: 1 }];
      const workspaces = [{ id: 1, name: 'w1' }];
      const units = [];

      mockRepository.find
        .mockResolvedValueOnce(wsUser) // workspaceUsersRepository
        .mockResolvedValueOnce(workspaces) // workspacesRepository
        .mockResolvedValue(units); // unitsRepository (inside map)

      const result = await service.findAll(userId);
      expect(result).toHaveLength(1);
    });
  });

  describe('setWorkspacesByUser', () => {
    it('should set workspaces', async () => {
      const userId = 1;
      const groupId = 2;
      const workspaces: UserWorkspaceAccessDto[] = [{ id: 1, accessLevel: 1 }];

      mockWorkspaceUserService.deleteAllByWorkspaceGroup.mockResolvedValue(null);
      mockRepository.create.mockReturnValue({});
      mockUnitService.findAllForWorkspace.mockResolvedValue([]);

      await service.setWorkspacesByUser(userId, groupId, workspaces);

      expect(mockWorkspaceUserService.deleteAllByWorkspaceGroup).toHaveBeenCalled();
    });
  });

  describe('findAllGroupwise', () => {
    it('should return groupwise workspaces', async () => {
      const userId = 1;
      mockUsersService.getUserIsAdmin.mockResolvedValue(true);
      mockRepository.find.mockResolvedValue([]); // workspaceGroupRepository & others inside findAll

      const result = await service.findAllGroupwise(userId);
      expect(result).toBeDefined();
    });
  });

  describe('findAllByGroup', () => {
    it('should return workspaces in group', async () => {
      const groupId = 1;
      mockRepository.find.mockResolvedValue([]);
      await service.findAllByGroup(groupId);
      expect(workspaceRepository.find).toHaveBeenCalledWith(expect.objectContaining({ where: { groupId } }));
    });
  });

  describe('findOne', () => {
    it('should return workspace', async () => {
      const ws = { id: 1, groupId: 2 };
      const group = { id: 2, name: 'g' };
      mockRepository.findOne
        .mockResolvedValueOnce(ws)
        .mockResolvedValueOnce(group);

      const result = await service.findOne(1);
      expect(result.id).toBe(1);
    });
  });

  describe('findOneByUser', () => {
    it('should return workspace for user', async () => {
      mockRepository.findOne
        .mockResolvedValueOnce({ id: 1, groupId: 2 }) // ws
        .mockResolvedValueOnce({ accessLevel: 1 }) // wsUser
        .mockResolvedValueOnce({ name: 'g' }); // group

      const result = await service.findOneByUser(1, 1);
      expect(result.id).toBe(1);
    });
  });

  describe('findAllWorkspaceGroups', () => {
    it('should return groups', async () => {
      const ws = { id: 1, settings: { unitGroups: ['g1'] } };
      const units = [{ groupName: 'g2' }];

      mockRepository.findOne.mockResolvedValue(ws);
      mockRepository.find.mockResolvedValue(units);

      const result = await service.findAllWorkspaceGroups(1);
      expect(result).toContain('g1');
      expect(result).toContain('g2');
    });
  });

  describe('create', () => {
    it('should create workspace', async () => {
      const dto = { name: 'w', groupId: 1 };
      const group = { id: 1, name: 'g' };
      const saved = { id: 1, ...dto };

      mockRepository.findOne.mockResolvedValue(group); // group check
      mockRepository.create.mockReturnValue(saved);
      mockRepository.save.mockResolvedValue(saved);

      const result = await service.create(dto as CreateWorkspaceDto);
      expect(result).toBe(1);
      expect(mockRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        settings: expect.objectContaining({
          hiddenRoutes: ['notes']
        })
      }));
    });
  });

  describe('patch', () => {
    it('should patch workspace', async () => {
      const ws = { id: 1, name: 'old' };
      mockRepository.findOne.mockResolvedValue(ws);

      await service.patch({ id: 1, name: 'new' });
      expect(ws.name).toBe('new');
    });
  });

  describe('patchWorkspaceGroups', () => {
    it('should patch group id', async () => {
      const IDs = [1];
      const newGroupId = 2;
      const user = { id: 1 } as User;
      const ws = { id: 1, groupId: 1 };
      const group = { id: 1, name: 'g' };

      mockRepository.findOne
        .mockResolvedValueOnce(ws)
        .mockResolvedValueOnce(group) // Inside findOne
        .mockResolvedValueOnce(ws); // Inside patch

      mockUnitService.findAllForWorkspace.mockResolvedValue([]);
      mockUsersService.isWorkspaceGroupAdmin.mockResolvedValue(true);

      await service.patchWorkspaceGroups(IDs, newGroupId, user);

      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('patchGroupName', () => {
    it('should rename group', async () => {
      const ws = { id: 1, settings: { unitGroups: ['old'] } };
      mockRepository.findOne.mockResolvedValue(ws); // renameGroupName

      await service.patchGroupName(1, { operation: 'rename', groupName: 'old', newGroupName: 'new' });
      expect(ws.settings.unitGroups).toContain('new');
      expect(mockRepository.update).toHaveBeenCalled();
    });
  });

  describe('patchName', () => {
    it('should patch name', async () => {
      const ws = { id: 1 } as Workspace;
      mockRepository.findOne.mockResolvedValue(ws);
      await service.patchName(1, 'new');
      expect(ws.name).toBe('new');
    });
  });

  describe('patchDropBoxId', () => {
    it('should patch dropbox id', async () => {
      const ws = { id: 1 } as Workspace;
      mockRepository.findOne.mockResolvedValue(ws);
      await service.patchDropBoxId(1, 100);
      expect(ws.dropBoxId).toBe(100);
    });
  });

  describe('patchSettings', () => {
    it('should patch settings', async () => {
      const ws = { id: 1, settings: {} as WorkspaceSettingsDto };
      mockRepository.findOne.mockResolvedValue(ws);
      mockUnitService.getUnitIdsByWorkspaceId.mockResolvedValue([]);

      await service.patchSettings(1, { defaultEditor: 'e' } as WorkspaceSettingsDto);
      expect(ws.settings.defaultEditor).toBe('e');
    });
  });

  describe('remove', () => {
    it('should remove workspace', async () => {
      await service.remove(1);
      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('getCodingReport', () => {
    it('should return report', async () => {
      mockUnitService.findAllWithProperties.mockResolvedValue([]);
      const result = await service.getCodingReport(1);
      expect(result).toEqual([]);
    });
  });

  describe('uploadFiles', () => {
    it('should process upload', async () => {
      const files: FileIo[] = [{
        originalname: 'test.xml',
        mimetype: 'text/xml',
        buffer: Buffer.from('<Unit><Metadata><Id>1</Id><Label>l</Label></Metadata></Unit>'),
        fieldname: 'file',
        encoding: '7bit',
        size: 100
      }];
      const user = { id: 1 } as User;

      mockUnitService.create.mockResolvedValue(10);
      mockUnitService.patchUnitProperties.mockResolvedValue([]); // importUnitProperties -> patchUnitProperties

      // Mocks for findOne inside importUnitProperties
      mockRepository.findOne.mockResolvedValue({ settings: {} } as Workspace);

      const result = await service.uploadFiles(1, files, user);

      expect(result.messages).toHaveLength(0); // Assuming no errors
      expect(mockUnitService.create).toHaveBeenCalled();
    });
  });
});
