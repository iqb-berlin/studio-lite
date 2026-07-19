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

  describe('mapImportedMetadata', () => {
    it('maps the unit-metadata@0.1 wrapper onto the internal profiles structure', () => {
      const mapped = WorkspaceService.mapImportedMetadata({
        changedAt: '2026-05-01T08:00:00.000Z',
        metadata: [{
          profileId: 'https://example.org/unit-profile.json',
          entries: [{
            id: 'iqb_author',
            label: [{ lang: 'de', value: 'Entwickler:in' }],
            value: [{ lang: 'de', value: 'Ana Maier' }]
          }]
        }]
      });

      expect(mapped).toEqual({
        profiles: [{
          profileId: 'https://example.org/unit-profile.json',
          entries: [{
            id: 'iqb_author',
            label: [{ lang: 'de', value: 'Entwickler:in' }],
            value: [{ lang: 'de', value: 'Ana Maier' }],
            valueAsText: [{ lang: 'de', value: 'Ana Maier' }]
          }]
        }]
      });
    });

    it('reconstructs value and valueAsText from a simple_value', () => {
      const mapped = WorkspaceService.mapImportedMetadata({
        metadata: [{
          profileId: 'p1',
          entries: [{
            id: 'a1',
            value: { raw: 'false', asText: [{ lang: 'de', value: 'nein' }] }
          }]
        }]
      });

      expect(mapped.profiles[0].entries[0]).toEqual({
        id: 'a1',
        label: [],
        value: 'false',
        valueAsText: [{ lang: 'de', value: 'nein' }]
      });
    });

    it('reconstructs internal vocabulary values ({ id, text }) from vocabulary_entries', () => {
      const mapped = WorkspaceService.mapImportedMetadata({
        metadata: [{
          profileId: 'p1',
          entries: [{
            id: 'w4',
            value: [{ id: 'https://w3id.org/iqb/vocab/p2', label: [{ lang: 'de', value: 'Anwenden' }] }]
          }]
        }]
      });

      expect(mapped.profiles[0].entries[0]).toEqual({
        id: 'w4',
        label: [],
        value: [{ id: 'https://w3id.org/iqb/vocab/p2', text: [{ lang: 'de', value: 'Anwenden' }] }],
        valueAsText: [{ lang: 'de', value: 'Anwenden' }]
      });
    });

    it('normalizes a legacy raw { profiles, items } blob, deriving order from isCurrent', () => {
      const legacy = {
        profiles: [
          { profileId: 'p1', isCurrent: true, entries: [] },
          { profileId: 'p2', isCurrent: false, entries: [] }
        ],
        items: [{ id: 'ITEM1', profiles: [{ profileId: 'ip1', isCurrent: true, entries: [] }] }]
      };

      expect(WorkspaceService.mapImportedMetadata(legacy)).toEqual({
        profiles: [
          { profileId: 'p1', order: 0, entries: [] },
          { profileId: 'p2', order: -1, entries: [] }
        ],
        items: [{ id: 'ITEM1', profiles: [{ profileId: 'ip1', order: 0, entries: [] }] }]
      });
    });

    it('keeps an explicit order on a legacy profile instead of deriving from isCurrent', () => {
      const legacy = {
        profiles: [{
          profileId: 'p1', order: 2, isCurrent: false, entries: []
        }],
        items: []
      };

      expect(WorkspaceService.mapImportedMetadata(legacy)).toEqual({
        profiles: [{ profileId: 'p1', order: 2, entries: [] }],
        items: []
      });
    });
  });

  describe('mapImportedItems', () => {
    it('maps unit-items@0.2 items onto the internal structure', () => {
      const mapped = WorkspaceService.mapImportedItems([{
        uuid: 'item-uuid-1',
        id: 'ITEM1',
        description: 'Notiz',
        order: 3,
        sourceVariableId: 'VAR1',
        sourceVariableUuid: 'var-uuid-1',
        changedAt: '2026-04-01T00:00:00.000Z',
        metadata: [{
          profileId: 'https://example.org/item-profile.json',
          entries: [{
            id: 'w4',
            label: [{ lang: 'de', value: 'Prozess' }],
            value: [{ lang: 'de', value: 'Anwenden' }]
          }]
        }]
      }]);

      expect(mapped).toEqual([{
        uuid: 'item-uuid-1',
        id: 'ITEM1',
        description: 'Notiz',
        order: 3,
        variableId: 'VAR1',
        variableReadOnlyId: 'var-uuid-1',
        createdAt: undefined,
        changedAt: new Date('2026-04-01T00:00:00.000Z'),
        profiles: [{
          profileId: 'https://example.org/item-profile.json',
          entries: [{
            id: 'w4',
            label: [{ lang: 'de', value: 'Prozess' }],
            value: [{ lang: 'de', value: 'Anwenden' }],
            valueAsText: [{ lang: 'de', value: 'Anwenden' }]
          }]
        }]
      }]);
    });

    it('defaults missing source variables to null', () => {
      const mapped = WorkspaceService.mapImportedItems([{ id: 'ITEM1' }]);

      expect(mapped[0].variableId).toBeNull();
      expect(mapped[0].variableReadOnlyId).toBeNull();
    });

    it('drops items without the required id', () => {
      const mapped = WorkspaceService.mapImportedItems([
        { uuid: 'item-uuid-1' } as never,
        { id: 'ITEM1' }
      ]);

      expect(mapped).toHaveLength(1);
      expect(mapped[0].id).toBe('ITEM1');
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

    it('should report unreferenced JSON that is not a valid unit index as ignored', async () => {
      const result = await service.uploadFiles(1, [
        buildFile('broken.json', 'application/json', JSON.stringify({ notId: 'something' }))
      ], user);

      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].messageKey).toBe('unit-upload.api-warning.ignore-file');
    });

    it('should not warn for companion JSON files that are not unit indices', async () => {
      const result = await service.uploadFiles(1, [
        buildFile('unit01.vocs.json', 'application/json', JSON.stringify({ something: 'else' }))
      ], user);

      expect(result.messages.every(m => m.messageKey !== 'unit-upload.api-warning.json-parse')).toBe(true);
    });

    it('should import companion files with arbitrary names when the index references them', async () => {
      (unitService.create as jest.Mock).mockResolvedValue(10);
      (unitService.patchScheme as jest.Mock).mockResolvedValue(undefined);
      (unitService.patchUnitProperties as jest.Mock).mockResolvedValue([]);
      (workspaceRepository.findOne as jest.Mock).mockResolvedValue({ settings: {} } as Workspace);

      const schemeContent = JSON.stringify({ variableCodings: [] });
      const result = await service.uploadFiles(1, [
        buildFile('unit01.json', 'application/json', jsonIndex('UNIT01', {
          codingScheme: { id: 'scheme.json', type: 'iqb-coding-scheme' }
        })),
        buildFile('scheme.json', 'application/json', schemeContent)
      ], user);

      expect(result.messages).toHaveLength(0);
      expect(unitService.patchScheme).toHaveBeenCalledWith(
        10,
        expect.objectContaining({ scheme: schemeContent }),
        null,
        undefined
      );
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

    it('should import vomd (unit-metadata@0.1) and voit (unit-items@0.2) files', async () => {
      (unitService.create as jest.Mock).mockResolvedValue(10);
      (unitService.patchUnitProperties as jest.Mock).mockResolvedValue([]);
      (unitService.copyItemsWithMetadata as jest.Mock).mockResolvedValue([]);
      (workspaceRepository.findOne as jest.Mock).mockResolvedValue({ settings: {} } as Workspace);

      const vomdContent = JSON.stringify({
        changedAt: '2026-05-01T08:00:00.000Z',
        metadata: [{
          profileId: 'https://example.org/unit-profile.json',
          entries: [{
            id: 'a1',
            label: [{ lang: 'de', value: 'Für SPF geeignet' }],
            value: { raw: 'false', asText: [{ lang: 'de', value: 'nein' }] }
          }]
        }]
      });
      const voitContent = JSON.stringify([{
        uuid: 'item-uuid-1',
        id: 'ITEM1',
        order: 0,
        sourceVariableId: 'VAR1',
        sourceVariableUuid: 'var-uuid-1'
      }]);

      const result = await service.uploadFiles(1, [
        buildFile('unit01.json', 'application/json', jsonIndex('UNIT01', {
          metadata: { id: 'unit01.vomd.json', type: 'unit-metadata@0.1' },
          items: { id: 'unit01.voit.json', type: 'unit-items@0.2' }
        })),
        buildFile('unit01.vomd.json', 'application/json', vomdContent),
        buildFile('unit01.voit.json', 'application/json', voitContent)
      ], user);

      expect(result.messages).toHaveLength(0);
      expect(unitService.copyItemsWithMetadata).toHaveBeenCalledWith(10, {
        profiles: [{
          profileId: 'https://example.org/unit-profile.json',
          order: -1,
          entries: [{
            id: 'a1',
            label: [{ lang: 'de', value: 'Für SPF geeignet' }],
            value: 'false',
            valueAsText: [{ lang: 'de', value: 'nein' }]
          }]
        }],
        items: [{
          uuid: 'item-uuid-1',
          id: 'ITEM1',
          description: undefined,
          order: 0,
          variableId: 'VAR1',
          variableReadOnlyId: 'var-uuid-1',
          createdAt: undefined,
          changedAt: undefined,
          profiles: []
        }]
      });
    });

    it('should still import a legacy raw vomd blob with embedded items', async () => {
      (unitService.create as jest.Mock).mockResolvedValue(10);
      (unitService.patchUnitProperties as jest.Mock).mockResolvedValue([]);
      (unitService.copyItemsWithMetadata as jest.Mock).mockResolvedValue([]);
      (workspaceRepository.findOne as jest.Mock).mockResolvedValue({ settings: {} } as Workspace);

      const legacyVomd = JSON.stringify({
        profiles: [{ profileId: 'p1', isCurrent: true, entries: [] }],
        items: [{ id: 'ITEM1', variableId: 'VAR1', profiles: [] }]
      });

      const result = await service.uploadFiles(1, [
        buildFile('unit01.json', 'application/json', jsonIndex('UNIT01', {
          metadata: { id: 'unit01.vomd.json', type: 'metadata-values' }
        })),
        buildFile('unit01.vomd.json', 'application/json', legacyVomd)
      ], user);

      expect(result.messages).toHaveLength(0);
      expect(unitService.copyItemsWithMetadata).toHaveBeenCalledWith(10, {
        profiles: [{ profileId: 'p1', order: -1, entries: [] }],
        items: [{ id: 'ITEM1', variableId: 'VAR1', profiles: [] }]
      });
    });

    it('should adopt the unit uuid from the index when present', async () => {
      (unitService.create as jest.Mock).mockResolvedValue(10);
      (unitService.patchUnitProperties as jest.Mock).mockResolvedValue([]);
      (workspaceRepository.findOne as jest.Mock).mockResolvedValue({ settings: {} } as Workspace);

      await service.uploadFiles(1, [
        buildFile('unit01.json', 'application/json', jsonIndex('UNIT01', { uuid: 'imported-unit-uuid' }))
      ], user);

      expect(unitService.adoptUuidIfFree).toHaveBeenCalledWith(10, 'imported-unit-uuid');
    });

    it('should not try to adopt a uuid when the index has none', async () => {
      (unitService.create as jest.Mock).mockResolvedValue(10);
      (unitService.patchUnitProperties as jest.Mock).mockResolvedValue([]);
      (workspaceRepository.findOne as jest.Mock).mockResolvedValue({ settings: {} } as Workspace);

      await service.uploadFiles(1, [
        buildFile('unit01.json', 'application/json', jsonIndex('UNIT01'))
      ], user);

      expect(unitService.adoptUuidIfFree).not.toHaveBeenCalled();
    });

    it('should warn and continue when a companion JSON file is broken', async () => {
      (unitService.create as jest.Mock).mockResolvedValue(10);
      (unitService.patchUnitProperties as jest.Mock).mockResolvedValue([]);
      (unitService.copyItemsWithMetadata as jest.Mock).mockResolvedValue([]);
      (workspaceRepository.findOne as jest.Mock).mockResolvedValue({ settings: {} } as Workspace);

      const result = await service.uploadFiles(1, [
        buildFile('unit01.json', 'application/json', jsonIndex('UNIT01', {
          metadata: { id: 'unit01.vomd.json', type: 'unit-metadata@0.1' },
          items: { id: 'unit01.voit.json', type: 'unit-items@0.2' }
        })),
        buildFile('unit01.vomd.json', 'application/json', '{ "metadata": broken !!!'),
        buildFile('unit01.voit.json', 'application/json', '[{ "id": "X", broken !!!')
      ], user);

      const parseWarnings = result.messages
        .filter(m => m.messageKey === 'unit-upload.api-warning.json-parse')
        .map(m => m.objectKey);
      expect(parseWarnings).toEqual(expect.arrayContaining(['unit01.vomd.json', 'unit01.voit.json']));
      expect(unitService.create).toHaveBeenCalledTimes(1);
      expect(unitService.copyItemsWithMetadata).not.toHaveBeenCalled();
    });

    it('should import remaining blocks when only one companion file is broken', async () => {
      (unitService.create as jest.Mock).mockResolvedValue(10);
      (unitService.patchUnitProperties as jest.Mock).mockResolvedValue([]);
      (unitService.copyItemsWithMetadata as jest.Mock).mockResolvedValue([]);
      (workspaceRepository.findOne as jest.Mock).mockResolvedValue({ settings: {} } as Workspace);

      const voitContent = JSON.stringify([{ id: 'ITEM1', sourceVariableId: 'VAR1' }]);
      const result = await service.uploadFiles(1, [
        buildFile('unit01.json', 'application/json', jsonIndex('UNIT01', {
          metadata: { id: 'unit01.vomd.json', type: 'unit-metadata@0.1' },
          items: { id: 'unit01.voit.json', type: 'unit-items@0.2' }
        })),
        buildFile('unit01.vomd.json', 'application/json', '{ broken'),
        buildFile('unit01.voit.json', 'application/json', voitContent)
      ], user);

      expect(result.messages.map(m => m.objectKey)).toEqual(['unit01.vomd.json']);
      expect(unitService.copyItemsWithMetadata).toHaveBeenCalledWith(10, expect.objectContaining({
        items: [expect.objectContaining({ id: 'ITEM1', variableId: 'VAR1' })]
      }));
    });

    it('should clear legacy items when the items file is legitimately empty', async () => {
      (unitService.create as jest.Mock).mockResolvedValue(10);
      (unitService.patchUnitProperties as jest.Mock).mockResolvedValue([]);
      (unitService.copyItemsWithMetadata as jest.Mock).mockResolvedValue([]);
      (workspaceRepository.findOne as jest.Mock).mockResolvedValue({ settings: {} } as Workspace);

      const legacyBlob = JSON.stringify({ profiles: [], items: [{ id: 'OLD' }] });
      const result = await service.uploadFiles(1, [
        buildFile('unit01.json', 'application/json', jsonIndex('UNIT01', {
          metadata: { id: 'unit01.vomd.json', type: 'metadata-values' },
          items: { id: 'unit01.voit.json', type: 'unit-items@0.2' }
        })),
        buildFile('unit01.vomd.json', 'application/json', legacyBlob),
        buildFile('unit01.voit.json', 'application/json', '[]')
      ], user);

      expect(result.messages).toHaveLength(0);
      expect(unitService.copyItemsWithMetadata).toHaveBeenCalledWith(10, expect.objectContaining({
        items: []
      }));
    });

    it('should silently accept an export report file without creating units or warnings', async () => {
      const result = await service.uploadFiles(1, [
        buildFile('_export-report.json', 'application/json', JSON.stringify({
          messages: [{ unitKey: 'U1', messageKey: 'dropped-content.metadata-not-exported' }]
        }))
      ], user);

      expect(result.messages).toHaveLength(0);
      expect(unitService.create).not.toHaveBeenCalled();
    });

    it('should warn when the items file referenced in the index is missing from the upload', async () => {
      (unitService.create as jest.Mock).mockResolvedValue(10);
      (unitService.patchUnitProperties as jest.Mock).mockResolvedValue([]);
      (workspaceRepository.findOne as jest.Mock).mockResolvedValue({ settings: {} } as Workspace);

      const result = await service.uploadFiles(1, [
        buildFile('unit01.json', 'application/json', jsonIndex('UNIT01', {
          items: { id: 'unit01.voit.json', type: 'unit-items@0.2' }
        }))
      ], user);

      expect(result.messages).toEqual([{
        objectKey: 'unit01.voit.json',
        messageKey: 'unit-upload.api-warning.missing-file'
      }]);
    });

    it('should warn when imported vocabulary entries carry annotations the model cannot hold', async () => {
      (unitService.create as jest.Mock).mockResolvedValue(10);
      (unitService.patchUnitProperties as jest.Mock).mockResolvedValue([]);
      (unitService.copyItemsWithMetadata as jest.Mock).mockResolvedValue([]);
      (workspaceRepository.findOne as jest.Mock).mockResolvedValue({ settings: {} } as Workspace);

      const vomdContent = JSON.stringify({
        metadata: [{
          profileId: 'https://example.org/unit-profile.json',
          entries: [{
            id: 'a1',
            value: [{
              id: 'https://w3id.org/iqb/vocab/p2',
              label: [{ lang: 'de', value: 'Anwenden' }],
              annotation: [{ lang: 'de', value: 'Hinweis' }]
            }]
          }]
        }]
      });
      const result = await service.uploadFiles(1, [
        buildFile('unit01.json', 'application/json', jsonIndex('UNIT01', {
          metadata: { id: 'unit01.vomd.json', type: 'unit-metadata@0.1' }
        })),
        buildFile('unit01.vomd.json', 'application/json', vomdContent)
      ], user);

      expect(result.messages).toEqual([{
        objectKey: 'unit01.vomd.json',
        messageKey: 'unit-upload.api-warning.annotation-dropped'
      }]);
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
