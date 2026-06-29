import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateWorkspaceDto, UserWorkspaceAccessDto, WorkspaceSettingsDto, RenameGroupNameDto
} from '@studio-lite-lib/api-dto';
import { VariableCodingData } from '@iqbspecs/coding-scheme/coding-scheme.interface';
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

  describe('determineCodingType', () => {
    it('maps closed coding to automatisch', () => {
      const codingType = WorkspaceService.determineCodingType({
        codes: [{
          type: 'RESIDUAL_AUTO',
          manualInstruction: '',
          ruleSets: [{ rules: [] }]
        }]
      } as unknown as VariableCodingData);

      expect(codingType).toBe('automatisch');
    });

    it('maps rules-based coding to halbautomatisch', () => {
      const codingType = WorkspaceService.determineCodingType({
        codes: [{
          manualInstruction: '',
          ruleSets: [{ rules: [{ method: 'MATCH', parameters: ['a'] }] }]
        }]
      } as unknown as VariableCodingData);

      expect(codingType).toBe('halbautomatisch');
    });

    it('maps manual coding to manuell', () => {
      const codingType = WorkspaceService.determineCodingType({
        codes: [{
          manualInstruction: 'Hinweis',
          ruleSets: [{ rules: [] }]
        }]
      } as unknown as VariableCodingData);

      expect(codingType).toBe('manuell');
    });
  });

  describe('determineVariableType', () => {
    it('maps base variables to Basisvariable', () => {
      const variableType = WorkspaceService.determineVariableType({
        sourceType: 'BASE'
      } as unknown as VariableCodingData);

      expect(variableType).toBe('Basisvariable');
    });

    it('maps derived variables to abgeleitete Variable', () => {
      const variableType = WorkspaceService.determineVariableType({
        sourceType: 'SUM_SCORE'
      } as unknown as VariableCodingData);

      expect(variableType).toBe('abgeleitete Variable');
    });
  });

  describe('determineTrainingEffort', () => {
    it('returns erhöht when CODER_TRAINING_REQUIRED is set', () => {
      const trainingEffort = WorkspaceService.determineTrainingEffort({
        processing: ['CODER_TRAINING_REQUIRED']
      } as unknown as VariableCodingData);

      expect(trainingEffort).toBe('erhöht');
    });

    it('returns normal when CODER_TRAINING_REQUIRED is not set', () => {
      const trainingEffort = WorkspaceService.determineTrainingEffort({
        processing: []
      } as unknown as VariableCodingData);

      expect(trainingEffort).toBe('normal');
    });
  });

  describe('mapImportedComment', () => {
    it('maps spec field names (commentator/isHidden/parentComment) onto the internal DTO', () => {
      const mapped = WorkspaceService.mapImportedComment({
        id: 7,
        body: 'a comment',
        commentator: 'Jane Doe',
        parentComment: 3,
        isHidden: true,
        createdAt: '2026-04-09T13:15:10.977Z',
        changedAt: '2026-04-10T13:15:10.977Z',
        itemUuids: ['item-uuid-1']
      });

      expect(mapped).toEqual({
        id: 7,
        body: 'a comment',
        userName: 'Jane Doe',
        userId: -1,
        parentId: 3,
        hidden: true,
        createdAt: new Date('2026-04-09T13:15:10.977Z'),
        changedAt: new Date('2026-04-10T13:15:10.977Z'),
        itemUuids: ['item-uuid-1']
      });
    });

    it('falls back to legacy field names (userName/hidden/parentId)', () => {
      const mapped = WorkspaceService.mapImportedComment({
        id: 1,
        body: 'legacy',
        userName: 'Old Name',
        parentId: 5,
        hidden: true
      });

      expect(mapped.userName).toBe('Old Name');
      expect(mapped.parentId).toBe(5);
      expect(mapped.hidden).toBe(true);
    });

    it('always sets userId to -1 regardless of any exported user id', () => {
      const mapped = WorkspaceService.mapImportedComment({ id: 1, body: 'x' });

      expect(mapped.userId).toBe(-1);
    });

    it('defaults parentId to null and hidden to false when absent', () => {
      const mapped = WorkspaceService.mapImportedComment({ id: 1, body: 'root' });

      expect(mapped.parentId).toBeNull();
      expect(mapped.hidden).toBe(false);
    });
  });

  describe('uploadFiles', () => {
    const user = { id: 1 } as User;
    const buildFile = (name: string, mime: string, content: string): FileIo => ({
      originalname: name,
      mimetype: mime,
      buffer: Buffer.from(content),
      fieldname: 'files',
      encoding: '7bit',
      size: content.length
    });
    const xmlUnit = (key: string) => `<Unit><Metadata><Id>${key}</Id><Label>L</Label></Metadata></Unit>`;
    const jsonIndex = (key: string, extra: object = {}) => JSON
      .stringify({ id: key, userInterface: { player: 'test-player' }, ...extra });

    it('should process upload', async () => {
      (unitService.create as jest.Mock).mockResolvedValue(10);
      (unitService.patchUnitProperties as jest.Mock).mockResolvedValue([]);
      (workspaceRepository.findOne as jest.Mock).mockResolvedValue({ settings: {} } as Workspace);

      const result = await service.uploadFiles(1, [
        buildFile('test.xml', 'text/xml', xmlUnit('1'))
      ], user);

      expect(result.messages).toHaveLength(0);
      expect(unitService.create).toHaveBeenCalled();
    });

    it('should prefer JSON over XML for the same unit key', async () => {
      (unitService.create as jest.Mock).mockResolvedValue(10);
      (unitService.patchUnitProperties as jest.Mock).mockResolvedValue([]);
      (workspaceRepository.findOne as jest.Mock).mockResolvedValue({ settings: {} } as Workspace);

      const result = await service.uploadFiles(1, [
        buildFile('unit01.xml', 'text/xml', xmlUnit('UNIT01')),
        buildFile('unit01.json', 'application/json', jsonIndex('UNIT01'))
      ], user);

      expect(result.messages).toHaveLength(0);
      expect(unitService.create).toHaveBeenCalledTimes(1);
    });

    it('should warn for non-companion JSON that is not a valid unit index', async () => {
      const result = await service.uploadFiles(1, [
        buildFile('broken.json', 'application/json', JSON.stringify({ notId: 'something' }))
      ], user);

      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].messageKey).toBe('unit-upload.api-warning.json-parse');
    });

    it('should not warn for companion JSON files that are not unit indices', async () => {
      const result = await service.uploadFiles(1, [
        buildFile('unit01.vocs.json', 'application/json', JSON.stringify({ something: 'else' }))
      ], user);

      expect(result.messages.every(m => m.messageKey !== 'unit-upload.api-warning.json-parse')).toBe(true);
    });

    it('should warn when definition file referenced in index is missing from upload', async () => {
      (unitService.create as jest.Mock).mockResolvedValue(10);
      (unitService.patchUnitProperties as jest.Mock).mockResolvedValue([]);
      (workspaceRepository.findOne as jest.Mock).mockResolvedValue({ settings: {} } as Workspace);

      const result = await service.uploadFiles(1, [
        buildFile(
          'unit01.json',
          'application/json',
          jsonIndex('UNIT01', { userInterface: { player: 'p', definition: 'unit01.voud' } })
        )
      ], user);

      expect(result.messages.some(m => m.messageKey === 'unit-upload.api-warning.missing-file')).toBe(true);
    });

    it('should load baseVariables from vova.json before importing definition', async () => {
      const baseVariables = [{
        id: 'VAR1',
        type: 'string',
        format: 'text',
        nullable: false,
        multiple: false
      }];
      const vovaContent = JSON.stringify({ baseVariables, derivedVariables: [] });

      (unitService.create as jest.Mock).mockResolvedValue(10);
      (unitService.patchDefinition as jest.Mock).mockResolvedValue(undefined);
      (unitService.patchUnitProperties as jest.Mock).mockResolvedValue([]);
      (workspaceRepository.findOne as jest.Mock).mockResolvedValue({ settings: {} } as Workspace);

      await service.uploadFiles(1, [
        buildFile('unit01.json', 'application/json', jsonIndex('UNIT01', {
          userInterface: { player: 'p', definition: 'unit01.voud' },
          variables: { id: 'unit01.vova.json', type: 'unit-variables' }
        })),
        buildFile('unit01.voud', 'application/octet-stream', '<definition/>'),
        buildFile('unit01.vova.json', 'application/json', vovaContent)
      ], user);

      expect(unitService.patchDefinition).toHaveBeenCalledWith(
        10,
        expect.objectContaining({ variables: baseVariables }),
        null,
        undefined
      );
    });

    it('should warn when coding scheme file referenced in index is missing from upload', async () => {
      (unitService.create as jest.Mock).mockResolvedValue(10);
      (unitService.patchUnitProperties as jest.Mock).mockResolvedValue([]);
      (workspaceRepository.findOne as jest.Mock).mockResolvedValue({ settings: {} } as Workspace);

      const result = await service.uploadFiles(1, [
        buildFile('unit01.json', 'application/json', jsonIndex('UNIT01', {
          codingScheme: { id: 'unit01.vocs.json', type: 'iqb-coding-scheme' }
        }))
      ], user);

      expect(result.messages.some(m => m.messageKey === 'unit-upload.api-warning.missing-file')).toBe(true);
    });
  });
});
