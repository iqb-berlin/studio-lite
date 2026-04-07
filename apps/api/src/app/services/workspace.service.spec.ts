import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateWorkspaceDto, UserWorkspaceAccessDto, WorkspaceSettingsDto, RenameGroupNameDto
} from '@studio-lite-lib/api-dto';
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
import { UnitRichNoteService } from './unit-rich-note.service';
import User from '../entities/user.entity';
import { FileIo } from '../interfaces/file-io.interface';

describe('WorkspaceService', () => {
  let service: WorkspaceService;
  let workspaceRepository: Repository<Workspace>;
  let workspaceUsersRepository: Repository<WorkspaceUser>;
  let workspaceGroupRepository: Repository<WorkspaceGroup>;
  let workspaceGroupAdminRepository: Repository<WorkspaceGroupAdmin>;
  let unitsRepository: Repository<Unit>;
  let workspaceUserService: WorkspaceUserService;
  let usersService: UsersService;
  let unitService: UnitService;
  let unitUserService: UnitUserService;
  let unitCommentService: UnitCommentService;
  let unitRichNoteService: UnitRichNoteService;

  beforeEach(async () => {
    workspaceRepository = createMock<Repository<Workspace>>();
    workspaceUsersRepository = createMock<Repository<WorkspaceUser>>();
    workspaceGroupRepository = createMock<Repository<WorkspaceGroup>>();
    workspaceGroupAdminRepository = createMock<Repository<WorkspaceGroupAdmin>>();
    unitsRepository = createMock<Repository<Unit>>();
    workspaceUserService = createMock<WorkspaceUserService>();
    usersService = createMock<UsersService>();
    unitService = createMock<UnitService>();
    unitUserService = createMock<UnitUserService>();
    unitCommentService = createMock<UnitCommentService>();
    unitRichNoteService = createMock<UnitRichNoteService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceService,
        { provide: getRepositoryToken(Workspace), useValue: workspaceRepository },
        { provide: getRepositoryToken(WorkspaceUser), useValue: workspaceUsersRepository },
        { provide: getRepositoryToken(WorkspaceGroup), useValue: workspaceGroupRepository },
        { provide: getRepositoryToken(WorkspaceGroupAdmin), useValue: workspaceGroupAdminRepository },
        { provide: getRepositoryToken(Unit), useValue: unitsRepository },
        { provide: WorkspaceUserService, useValue: workspaceUserService },
        { provide: UsersService, useValue: usersService },
        { provide: UnitService, useValue: unitService },
        { provide: UnitUserService, useValue: unitUserService },
        { provide: UnitCommentService, useValue: unitCommentService },
        { provide: UnitRichNoteService, useValue: unitRichNoteService }
      ]
    }).compile();

    service = module.get<WorkspaceService>(WorkspaceService);
    workspaceRepository = module.get<Repository<Workspace>>(getRepositoryToken(Workspace));
    workspaceUsersRepository = module.get<Repository<WorkspaceUser>>(getRepositoryToken(WorkspaceUser));
    workspaceGroupRepository = module.get<Repository<WorkspaceGroup>>(getRepositoryToken(WorkspaceGroup));
    workspaceGroupAdminRepository = module
      .get<Repository<WorkspaceGroupAdmin>>(getRepositoryToken(WorkspaceGroupAdmin));
    unitsRepository = module.get<Repository<Unit>>(getRepositoryToken(Unit));
    workspaceUserService = module.get<WorkspaceUserService>(WorkspaceUserService);
    usersService = module.get<UsersService>(UsersService);
    unitService = module.get<UnitService>(UnitService);
    unitUserService = module.get<UnitUserService>(UnitUserService);
    unitCommentService = module.get<UnitCommentService>(UnitCommentService);
    unitRichNoteService = module.get<UnitRichNoteService>(UnitRichNoteService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllWorkspaces', () => {
    it('should return all', async () => {
      (workspaceRepository.find as jest.Mock).mockResolvedValue([]);
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

      (workspaceUsersRepository.find as jest.Mock).mockResolvedValueOnce(wsUser);
      (workspaceRepository.find as jest.Mock).mockResolvedValueOnce(workspaces);
      (unitsRepository.find as jest.Mock).mockResolvedValue(units);

      const result = await service.findAll(userId);
      expect(result).toHaveLength(1);
    });
  });

  describe('setWorkspacesByUser', () => {
    it('should set workspaces', async () => {
      const userId = 1;
      const groupId = 2;
      const workspaces: UserWorkspaceAccessDto[] = [{ id: 1, accessLevel: 1 }];

      (workspaceUserService.deleteAllByWorkspaceGroup as jest.Mock).mockResolvedValue(null);
      (workspaceUsersRepository.create as jest.Mock).mockReturnValue({});
      (unitService.findAllForWorkspace as jest.Mock).mockResolvedValue([]);

      await service.setWorkspacesByUser(userId, groupId, workspaces);

      expect(workspaceUserService.deleteAllByWorkspaceGroup).toHaveBeenCalled();
    });
  });

  describe('findAllGroupwise', () => {
    it('should return groupwise workspaces', async () => {
      const userId = 1;
      (usersService.getUserIsAdmin as jest.Mock).mockResolvedValue(true);
      (workspaceGroupRepository.find as jest.Mock).mockResolvedValue([]);
      (workspaceRepository.find as jest.Mock).mockResolvedValue([]);
      (workspaceUsersRepository.find as jest.Mock).mockResolvedValue([]);

      const result = await service.findAllGroupwise(userId);
      expect(result).toBeDefined();
    });
  });

  describe('findAllByGroup', () => {
    it('should return workspaces in group', async () => {
      const groupId = 1;
      (workspaceRepository.find as jest.Mock).mockResolvedValue([]);
      await service.findAllByGroup(groupId);
      expect(workspaceRepository.find).toHaveBeenCalledWith(expect.objectContaining({ where: { groupId } }));
    });
  });

  describe('findOne', () => {
    it('should return workspace', async () => {
      const ws = { id: 1, groupId: 2 };
      const group = { id: 2, name: 'g' };
      (workspaceRepository.findOne as jest.Mock).mockResolvedValue(ws);
      (workspaceGroupRepository.findOne as jest.Mock).mockResolvedValue(group);

      const result = await service.findOne(1);
      expect(result.id).toBe(1);
    });
  });

  describe('findOneByUser', () => {
    it('should return workspace for user', async () => {
      (workspaceRepository.findOne as jest.Mock).mockResolvedValue({ id: 1, groupId: 2 });
      (workspaceUsersRepository.findOne as jest.Mock).mockResolvedValue({ accessLevel: 1 });
      (workspaceGroupRepository.findOne as jest.Mock).mockResolvedValue({ name: 'g' });

      const result = await service.findOneByUser(1, 1);
      expect(result.id).toBe(1);
    });
  });

  describe('findAllWorkspaceGroups', () => {
    it('should return groups', async () => {
      const ws = { id: 1, settings: { unitGroups: ['g1'] } };
      const units = [{ groupName: 'g2' }];

      (workspaceRepository.findOne as jest.Mock).mockResolvedValue(ws);
      (unitsRepository.find as jest.Mock).mockResolvedValue(units);

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

      (workspaceGroupRepository.findOne as jest.Mock).mockResolvedValue(group);
      (workspaceRepository.create as jest.Mock).mockReturnValue(saved);
      (workspaceRepository.save as jest.Mock).mockResolvedValue(saved);

      const result = await service.create(dto as CreateWorkspaceDto);
      expect(result).toBe(1);
      expect(workspaceRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        settings: expect.objectContaining({
          hiddenRoutes: ['notes']
        })
      }));
    });
  });

  describe('patch', () => {
    it('should patch workspace', async () => {
      const ws = { id: 1, name: 'old' };
      (workspaceRepository.findOne as jest.Mock).mockResolvedValue(ws);

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

      (workspaceRepository.findOne as jest.Mock).mockResolvedValueOnce(ws);
      (workspaceGroupRepository.findOne as jest.Mock).mockResolvedValueOnce(group);
      (workspaceRepository.findOne as jest.Mock).mockResolvedValueOnce(ws);

      (unitService.findAllForWorkspace as jest.Mock).mockResolvedValue([]);
      (usersService.isWorkspaceGroupAdmin as jest.Mock).mockResolvedValue(true);

      await service.patchWorkspaceGroups(IDs, newGroupId, user);

      expect(workspaceRepository.save).toHaveBeenCalled();
    });
  });

  describe('patchGroupName', () => {
    it('should rename group', async () => {
      const ws = { id: 1, settings: { unitGroups: ['old'] } };
      jest.spyOn(workspaceRepository, 'findOne').mockResolvedValue(ws as unknown as Workspace);
      jest.spyOn(workspaceRepository, 'save').mockResolvedValue({} as never);
      jest.spyOn(unitsRepository, 'update').mockResolvedValue({} as never);

      await service.patchGroupName(1, {
        operation: 'rename',
        groupName: 'old',
        newGroupName: 'new'
      } as unknown as RenameGroupNameDto);
      expect(ws.settings.unitGroups).toContain('new');
      expect(workspaceRepository.save).toHaveBeenCalled();
      expect(unitsRepository.update).toHaveBeenCalled();
    });
  });

  describe('patchName', () => {
    it('should patch name', async () => {
      const ws = { id: 1 } as Workspace;
      (workspaceRepository.findOne as jest.Mock).mockResolvedValue(ws);
      await service.patchName(1, 'new');
      expect(ws.name).toBe('new');
    });
  });

  describe('patchDropBoxId', () => {
    it('should patch dropbox id', async () => {
      const ws = { id: 1 } as Workspace;
      (workspaceRepository.findOne as jest.Mock).mockResolvedValue(ws);
      await service.patchDropBoxId(1, 100);
      expect(ws.dropBoxId).toBe(100);
    });
  });

  describe('patchSettings', () => {
    it('should patch settings', async () => {
      const ws = { id: 1, settings: {} as WorkspaceSettingsDto };
      (workspaceRepository.findOne as jest.Mock).mockResolvedValue(ws);
      (unitService.getUnitIdsByWorkspaceId as jest.Mock).mockResolvedValue([]);

      await service.patchSettings(1, { defaultEditor: 'e' } as WorkspaceSettingsDto);
      expect(ws.settings.defaultEditor).toBe('e');
    });
  });

  describe('remove', () => {
    it('should remove workspace', async () => {
      await service.remove(1);
      expect(workspaceRepository.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('getCodingReport', () => {
    it('should return report', async () => {
      (unitService.findAllWithProperties as jest.Mock).mockResolvedValue([]);
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

      (unitService.create as jest.Mock).mockResolvedValue(10);
      (unitService.patchUnitProperties as jest.Mock).mockResolvedValue([]);
      (workspaceRepository.findOne as jest.Mock).mockResolvedValue({ settings: {} } as Workspace);

      const result = await service.uploadFiles(1, files, user);

      expect(result.messages).toHaveLength(0);
      expect(unitService.create).toHaveBeenCalled();
    });
  });
});
