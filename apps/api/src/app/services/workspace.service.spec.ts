import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  EntityManager, In, Repository, UpdateResult
} from 'typeorm';
import {
  CodingReportDto, CreateWorkspaceDto, UnitPropertiesDto, UsersWorkspaceInListDto,
  WorkspaceSettingsDto, RenameGroupNameDto
} from '@studio-lite-lib/api-dto';
import { WorkspaceService } from './workspace.service';
import { CodingReportClass } from '../classes/coding-report.class';
import Workspace from '../entities/workspace.entity';
import WorkspaceUser from '../entities/workspace-user.entity';
import WorkspaceGroup from '../entities/workspace-group.entity';
import WorkspaceGroupAdmin from '../entities/workspace-group-admin.entity';
import Unit from '../entities/unit.entity';
import { WorkspaceUserService } from './workspace-user.service';
import { UsersService } from './users.service';
import { UnitService } from './unit.service';
import { UnitMetadataService } from './unit-metadata.service';
import { UnitUserService } from './unit-user.service';
import { AdminWorkspaceNotFoundException } from '../exceptions/admin-workspace-not-found.exception';
import { GroupAdminUnprocessableWorkspaceException } from '../exceptions/group-admin-unprocessable-workspace.exception';

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
  let unitMetadataService: UnitMetadataService;
  let unitUserService: UnitUserService;

  beforeEach(async () => {
    workspaceRepository = createMock<Repository<Workspace>>();
    workspaceUsersRepository = createMock<Repository<WorkspaceUser>>();
    workspaceGroupRepository = createMock<Repository<WorkspaceGroup>>();
    workspaceGroupAdminRepository = createMock<Repository<WorkspaceGroupAdmin>>();
    unitsRepository = createMock<Repository<Unit>>();
    workspaceUserService = createMock<WorkspaceUserService>();
    usersService = createMock<UsersService>();
    unitService = createMock<UnitService>();
    unitMetadataService = createMock<UnitMetadataService>();
    unitUserService = createMock<UnitUserService>();

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
        { provide: UnitMetadataService, useValue: unitMetadataService },
        { provide: UnitUserService, useValue: unitUserService }
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
    unitMetadataService = module.get<UnitMetadataService>(UnitMetadataService);
    unitUserService = module.get<UnitUserService>(UnitUserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
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

  // A group admin used to get a person's workspaces in every group, names and access levels
  // included (#1650).
  describe('findAllInAdministeredGroups', () => {
    const personsWorkspaces = [
      { id: 1, groupId: 10 },
      { id: 2, groupId: 20 },
      { id: 3, groupId: 30 }
    ] as UsersWorkspaceInListDto[];

    beforeEach(() => {
      jest.spyOn(service, 'findAll').mockResolvedValue(personsWorkspaces);
    });

    it('should keep only the workspaces in groups the requester administers', async () => {
      (usersService.getUserIsAdmin as jest.Mock).mockResolvedValue(false);
      (workspaceGroupAdminRepository.find as jest.Mock).mockResolvedValue([
        { workspaceGroupId: 10 }, { workspaceGroupId: 30 }
      ] as WorkspaceGroupAdmin[]);

      const result = await service.findAllInAdministeredGroups(5, 7);

      expect(service.findAll).toHaveBeenCalledWith(5);
      expect(workspaceGroupAdminRepository.find).toHaveBeenCalledWith({
        where: { userId: 7 },
        select: { workspaceGroupId: true }
      });
      expect(result.map(workspace => workspace.id)).toEqual([1, 3]);
    });

    it('should answer with nothing for a person who works in none of the requester\'s groups', async () => {
      (usersService.getUserIsAdmin as jest.Mock).mockResolvedValue(false);
      (workspaceGroupAdminRepository.find as jest.Mock).mockResolvedValue([
        { workspaceGroupId: 99 }
      ] as WorkspaceGroupAdmin[]);

      expect(await service.findAllInAdministeredGroups(5, 7)).toEqual([]);
    });

    it('should let an administrator see all of them', async () => {
      (usersService.getUserIsAdmin as jest.Mock).mockResolvedValue(true);

      expect(await service.findAllInAdministeredGroups(5, 1)).toBe(personsWorkspaces);
      expect(workspaceGroupAdminRepository.find).not.toHaveBeenCalled();
    });
  });

  describe('setWorkspacesByUser', () => {
    // These rows are the user's access to the workspaces of the group (#1957).
    it('should replace the access of the user in the group by one row per workspace with its level', async () => {
      const deleteRows = workspaceUserService.deleteAllByWorkspaceGroup as jest.Mock;
      const saveRow = workspaceUsersRepository.save as jest.Mock;
      deleteRows.mockResolvedValue(null);
      (workspaceUsersRepository.create as jest.Mock).mockImplementation(row => row);
      (unitService.findAllForWorkspace as jest.Mock)
        .mockImplementation(async (workspaceId: number) => (workspaceId === 4 ? [{ id: 40 }] : []));

      await service.setWorkspacesByUser(7, 2, [{ id: 1, accessLevel: 1 }, { id: 4, accessLevel: 3 }]);

      expect(deleteRows).toHaveBeenCalledWith(2, 7);
      // the old rows go first: deleted afterwards, they would take the new ones with them
      expect(deleteRows.mock.invocationCallOrder[0]).toBeLessThan(saveRow.mock.invocationCallOrder[0]);
      expect(saveRow).toHaveBeenCalledTimes(2);
      expect(saveRow).toHaveBeenCalledWith({ userId: 7, workspaceId: 1, accessLevel: 1 });
      expect(saveRow).toHaveBeenCalledWith({ userId: 7, workspaceId: 4, accessLevel: 3 });
      expect(unitUserService.createUnitUser).toHaveBeenCalledWith(7, 40);
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

    // The workspace report of the administration asks without a user (DownloadWorkspacesClass).
    it('should list every group with every workspace when asked without a user', async () => {
      (workspaceGroupRepository.find as jest.Mock).mockResolvedValue([{ id: 1, name: 'g1' }, { id: 2, name: 'g2' }]);
      (workspaceRepository.find as jest.Mock).mockResolvedValue([{ id: 10, groupId: 1 }, { id: 20, groupId: 1 }]);
      (unitsRepository.find as jest.Mock).mockResolvedValue([]);

      const groups = await service.findAllGroupwise();

      expect(groups.map(({ id, workspaces }) => ({ id, workspaces: workspaces.map(workspace => workspace.id) })))
        .toEqual([{ id: 1, workspaces: [10, 20] }, { id: 2, workspaces: [] }]);
      expect(workspaceUsersRepository.find).not.toHaveBeenCalled();
    });

    describe('for the groups', () => {
      beforeEach(() => {
        (workspaceGroupRepository.find as jest.Mock).mockResolvedValue([
          { id: 1, name: 'administered, empty' },
          { id: 2, name: 'foreign, empty' },
          { id: 3, name: 'foreign, with a workspace of the user' }
        ] as WorkspaceGroup[]);
        jest.spyOn(service, 'findAll').mockResolvedValue([{ id: 30, groupId: 3 }] as UsersWorkspaceInListDto[]);
      });

      it('should let an administrator administer every group and list them all', async () => {
        (usersService.getUserIsAdmin as jest.Mock).mockResolvedValue(true);

        const groups = await service.findAllGroupwise(5);

        expect(groups.map(({ id, isAdmin }) => ({ id, isAdmin }))).toEqual([
          { id: 1, isAdmin: true }, { id: 2, isAdmin: true }, { id: 3, isAdmin: true }
        ]);
      });

      // A group admin has to reach an empty group to fill it; other groups show only where the user works.
      it('should list the groups a group admin administers, empty or not, and the others only with a workspace',
        async () => {
          (usersService.getUserIsAdmin as jest.Mock).mockResolvedValue(false);
          (workspaceGroupAdminRepository.find as jest.Mock).mockResolvedValue([{ workspaceGroupId: 1 }]);

          const groups = await service.findAllGroupwise(5);

          expect(groups.map(({ id, isAdmin, workspaces }) => ({ id, isAdmin, workspaces: workspaces.length })))
            .toEqual([{ id: 1, isAdmin: true, workspaces: 0 }, { id: 3, isAdmin: false, workspaces: 1 }]);
        });
    });
  });

  describe('findGroupIdsOfWorkspaces', () => {
    it('should name each group once and ignore ids that belong to no workspace', async () => {
      // Two of the three ids share a group and the third belongs to nothing: the caller wants the
      // groups this list reaches, not one answer per id.
      (workspaceRepository.find as jest.Mock).mockResolvedValue([{ groupId: 7 }, { groupId: 7 }, { groupId: 8 }]);

      const result = await service.findGroupIdsOfWorkspaces([1, 2, 3, 999]);

      expect(result).toEqual([7, 8]);
      expect(workspaceRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({ select: { groupId: true } })
      );
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

  it.each([
    ['findOne', () => service.findOne(9)],
    ['findAllWorkspaceGroups', () => service.findAllWorkspaceGroups(9)]
  ])('should answer %s for an unknown workspace with not found', async (_, call) => {
    (workspaceRepository.findOne as jest.Mock).mockResolvedValue(null);

    await expect(call()).rejects.toThrow(AdminWorkspaceNotFoundException);
    expect(workspaceRepository.save).not.toHaveBeenCalled();
  });

  describe('findOneByUser', () => {
    // The frontend opens a workspace with this level; for an unassigned administrator it is the
    // implicit one, where there used to be "workspace not found" (#1571).
    it('should hand on the level WorkspaceUserService grants, the implicit one of an administrator included',
      async () => {
        (workspaceRepository.findOne as jest.Mock).mockResolvedValue({ id: 1, groupId: 2 });
        (workspaceUserService.accessLevel as jest.Mock).mockResolvedValue(1);
        (workspaceGroupRepository.findOne as jest.Mock).mockResolvedValue({ name: 'g' });

        const result = await service.findOneByUser(1, 5);

        expect(workspaceUserService.accessLevel).toHaveBeenCalledWith(5, 1);
        expect(result.userAccessLevel).toBe(1);
      });

    it('should refuse a user who holds no level in the workspace', async () => {
      (workspaceRepository.findOne as jest.Mock).mockResolvedValue({ id: 1, groupId: 2 });
      (workspaceUserService.accessLevel as jest.Mock).mockResolvedValue(null);

      await expect(service.findOneByUser(1, 5)).rejects.toThrow(AdminWorkspaceNotFoundException);
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

    it('should name each group of the units once, sorted, without the empty one', async () => {
      (workspaceRepository.findOne as jest.Mock).mockResolvedValue({ id: 1, settings: { unitGroups: ['B'] } });
      (unitsRepository.find as jest.Mock).mockResolvedValue(
        [{ groupName: 'C' }, { groupName: '' }, { groupName: 'A' }, { groupName: 'C' }, { groupName: 'B' }]
      );

      expect(await service.findAllWorkspaceGroups(1)).toEqual(['A', 'B', 'C']);
    });

    it('should take the groups of the units alone when the settings name none', async () => {
      (workspaceRepository.findOne as jest.Mock).mockResolvedValue({ id: 1, settings: {} });
      (unitsRepository.find as jest.Mock).mockResolvedValue([{ groupName: 'A' }]);

      expect(await service.findAllWorkspaceGroups(1)).toEqual(['A']);
    });
  });

  describe('patchGroupName', () => {
    const groupName = (name: string, operation: 'add' | 'remove') => service
      .patchGroupName(1, { groupName: name, operation });

    it.each([
      ['add a group', 'Beta', ['Alpha', 'Beta'], 1],
      ['not add a group that differs only in case', 'ALPHA', ['Alpha'], 0]
    ])('should %s', async (_, name, expected, saves) => {
      const workspace = { id: 1, settings: { unitGroups: ['Alpha'] } };
      (workspaceRepository.findOne as jest.Mock).mockResolvedValue(workspace);

      await groupName(name, 'add');

      expect(workspace.settings.unitGroups).toEqual(expected);
      expect(workspaceRepository.save).toHaveBeenCalledTimes(saves);
    });

    it('should add the first group to a workspace without settings', async () => {
      const workspace: Partial<Workspace> = { id: 1, settings: null };
      (workspaceRepository.findOne as jest.Mock).mockResolvedValue(workspace);

      await groupName('Alpha', 'add');

      expect(workspace.settings.unitGroups).toEqual(['Alpha']);
    });

    it('should take a removed group out of the settings and off its units', async () => {
      const workspace = { id: 1, settings: { unitGroups: ['Alpha', 'Beta'] } };
      (workspaceRepository.findOne as jest.Mock).mockResolvedValue(workspace);

      await groupName('Alpha', 'remove');

      expect(workspace.settings.unitGroups).toEqual(['Beta']);
      expect(workspaceRepository.save).toHaveBeenCalledWith(workspace);
      expect(unitsRepository.update).toHaveBeenCalledWith({ workspaceId: 1, groupName: 'Alpha' }, { groupName: '' });
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

    describe('in a group holding workspaces already', () => {
      const givenGroup = (name: string, workspaces: number) => {
        (workspaceGroupRepository.findOne as jest.Mock).mockResolvedValue({ id: 1, name });
        (workspaceRepository.find as jest.Mock).mockResolvedValue(new Array(workspaces).fill({}));
        (workspaceRepository.save as jest.Mock).mockResolvedValue({ id: 5 });
      };
      const create = () => service.create({ name: 'w', groupId: 1 } as CreateWorkspaceDto);

      // The frontend keeps the same limit; this is the one that holds.
      it('should refuse an eleventh workspace in a backup group', async () => {
        givenGroup('Backup 2024', 10);

        await expect(create()).rejects.toThrow(GroupAdminUnprocessableWorkspaceException);
        expect(workspaceRepository.save).not.toHaveBeenCalled();
      });

      it.each([
        ['a tenth workspace in a backup group', 'Backup 2024', 9],
        ['an eleventh workspace in another group', 'Mathe', 10]
      ])('should create %s', async (_, name, workspaces) => {
        givenGroup(name, workspaces);

        expect(await create()).toBe(5);
      });
    });
  });

  describe('patchWorkspaceGroups', () => {
    let manager: DeepMocked<EntityManager>;

    beforeEach(() => {
      (workspaceRepository.find as jest.Mock).mockResolvedValue([
        createMock<Workspace>({ id: 1, groupId: 1 }),
        createMock<Workspace>({ id: 2, groupId: 2 })
      ]);
      manager = createMock<EntityManager>();
      Object.defineProperty(workspaceRepository, 'manager', {
        value: {
          transaction: jest.fn().mockImplementation(
            (work: (entityManager: EntityManager) => Promise<void>) => work(manager)
          )
        },
        configurable: true
      });
    });

    it('should move the workspaces and reset the states of their units', async () => {
      await service.patchWorkspaceGroups([1, 2], 3);

      expect(manager.update).toHaveBeenCalledWith(Workspace, { id: In([1, 2]) }, { groupId: 3 });
      expect(manager.update).toHaveBeenCalledWith(Unit, { workspaceId: In([1, 2]) }, { state: '0' });
    });

    it('should leave a workspace that is already in the target group as it is', async () => {
      await service.patchWorkspaceGroups([1, 2], 2);

      expect(manager.update).toHaveBeenCalledTimes(2);
      expect(manager.update).toHaveBeenCalledWith(Workspace, { id: In([1]) }, { groupId: 2 });
      expect(manager.update).toHaveBeenCalledWith(Unit, { workspaceId: In([1]) }, { state: '0' });
    });

    it('should recognise the target group when it is sent as a string', async () => {
      await service.patchWorkspaceGroups([1, 2], '2' as unknown as number);

      expect(manager.update).toHaveBeenCalledWith(Workspace, { id: In([1]) }, { groupId: 2 });
      expect(manager.update).toHaveBeenCalledWith(Unit, { workspaceId: In([1]) }, { state: '0' });
    });

    it('should change nothing when no workspace leaves its group', async () => {
      (workspaceRepository.find as jest.Mock).mockResolvedValue([createMock<Workspace>({ id: 2, groupId: 2 })]);

      await service.patchWorkspaceGroups([2], 2);

      expect(workspaceRepository.manager.transaction).not.toHaveBeenCalled();
      expect(workspaceRepository.update).not.toHaveBeenCalled();
      expect(unitsRepository.update).not.toHaveBeenCalled();
    });

    it('should not be done before the states are reset (#1984)', async () => {
      let resetDone: () => void = () => undefined;
      manager.update.mockImplementation((target: unknown) => (target === Unit ?
        new Promise(resolve => { resetDone = () => resolve(createMock<UpdateResult>()); }) :
        Promise.resolve(createMock<UpdateResult>())));
      let moved = false;

      const move = service.patchWorkspaceGroups([1], 3).then(() => { moved = true; });
      await new Promise(process.nextTick);
      expect(manager.update).toHaveBeenCalledWith(Unit, expect.anything(), { state: '0' });
      expect(moved).toBe(false);

      resetDone();
      await move;
      expect(moved).toBe(true);
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

  describe('dropBoxIdOf', () => {
    it('should return the drop box of the workspace', async () => {
      (workspaceRepository.findOne as jest.Mock).mockResolvedValue({ id: 1, dropBoxId: 7 } as Workspace);

      expect(await service.dropBoxIdOf(1)).toBe(7);
      expect(workspaceRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 }, select: ['id', 'dropBoxId'] });
    });

    it.each([[{ id: 1, dropBoxId: null }], [null]])('should return null for %p', async workspace => {
      (workspaceRepository.findOne as jest.Mock).mockResolvedValue(workspace);

      expect(await service.dropBoxIdOf(1)).toBeNull();
    });
  });

  describe('patchDropBoxId', () => {
    const lookup = (workspaces: Partial<Workspace>[]) => (workspaceRepository.findOne as jest.Mock)
      .mockImplementation(async ({ where }) => workspaces.find(w => w.id === where.id) ?? null);

    it('should patch dropbox id', async () => {
      const ws = { id: 1, groupId: 7 } as Workspace;
      lookup([ws, { id: 100, groupId: 7 }]);
      await service.patchDropBoxId(1, 100);
      expect(ws.dropBoxId).toBe(100);
    });

    it('should clear the drop box', async () => {
      const ws = { id: 1, groupId: 7, dropBoxId: 100 } as Workspace;
      lookup([ws]);
      await service.patchDropBoxId(1, null);
      expect(ws.dropBoxId).toBeNull();
      expect(workspaceRepository.save).toHaveBeenCalledWith(ws);
    });

    // #1805: a drop box is another workspace of the same group
    it.each([
      ['of another group', 200],
      ['that does not exist', 300],
      ['that is the workspace itself', 1]
    ])('should refuse a drop box %s, and leave the setting as it was', async (_, dropBoxId) => {
      const ws = { id: 1, groupId: 7, dropBoxId: 100 } as Workspace;
      lookup([ws, { id: 100, groupId: 7 }, { id: 200, groupId: 8 }]);

      await expect(service.patchDropBoxId(1, dropBoxId)).rejects.toThrow(AdminWorkspaceNotFoundException);
      expect(ws.dropBoxId).toBe(100);
      expect(workspaceRepository.save).not.toHaveBeenCalled();
    });

    it('should refuse the workspace itself when the route hands its id on as text', async () => {
      const ws = { id: 1, groupId: 7 } as Workspace;
      (workspaceRepository.findOne as jest.Mock)
        .mockImplementation(async ({ where }) => ([ws].find(w => w.id === Number(where.id)) ?? null));

      await expect(service.patchDropBoxId('1' as unknown as number, 1)).rejects.toThrow(AdminWorkspaceNotFoundException);
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

    // #1570: a client still holding the retired spelling must not undo the
    // migration of this column.
    it('canonicalizes the configured profile urls before storing them', async () => {
      const ws = { id: 1, settings: {} as WorkspaceSettingsDto };
      (workspaceRepository.findOne as jest.Mock).mockResolvedValue(ws);
      (unitService.getUnitIdsByWorkspaceId as jest.Mock).mockResolvedValue([]);

      await service.patchSettings(1, {
        unitMDProfile: 'https://raw.githubusercontent.com/iqb-vocabs/p11/master/unit.json',
        itemMDProfile: 'https://w3id.org/iqb/p11/item',
        defaultEditor: 'e'
      } as WorkspaceSettingsDto);

      expect(ws.settings.unitMDProfile).toBe('https://w3id.org/iqb/p11/unit/');
      expect(ws.settings.itemMDProfile).toBe('https://w3id.org/iqb/p11/item/');
    });

    it('leaves a foreign profile url and absent profile keys alone', async () => {
      const ws = { id: 1, settings: {} as WorkspaceSettingsDto };
      (workspaceRepository.findOne as jest.Mock).mockResolvedValue(ws);
      (unitService.getUnitIdsByWorkspaceId as jest.Mock).mockResolvedValue([]);

      await service.patchSettings(1, {
        unitMDProfile: 'https://example.org/own/profile.json'
      } as WorkspaceSettingsDto);

      expect(ws.settings.unitMDProfile).toBe('https://example.org/own/profile.json');
      expect(ws.settings.itemMDProfile).toBeUndefined();
    });

    // #1576: replacing the settings blob made every partial PATCH a profile
    // removal, which hid the metadata of every unit in the workspace.
    describe('profile reclassification (#1576)', () => {
      const unitProfile = 'https://w3id.org/iqb/p11/unit/';
      const itemProfile = 'https://w3id.org/iqb/p11/item/';
      const storedSettings = () => ({
        defaultEditor: 'old-editor',
        unitMDProfile: unitProfile,
        itemMDProfile: itemProfile
      } as WorkspaceSettingsDto);

      it('keeps the stored profiles and does not reclassify when the PATCH does not carry the profile keys', async () => {
        const ws = { id: 1, settings: storedSettings() };
        (workspaceRepository.findOne as jest.Mock).mockResolvedValue(ws);
        (unitService.getUnitIdsByWorkspaceId as jest.Mock).mockResolvedValue([7, 8]);

        await service.patchSettings(1, { defaultEditor: 'new-editor' } as WorkspaceSettingsDto);

        expect(ws.settings.defaultEditor).toBe('new-editor');
        expect(ws.settings.unitMDProfile).toBe(unitProfile);
        expect(ws.settings.itemMDProfile).toBe(itemProfile);
        expect(unitMetadataService.patchMetadataCurrentProfile).not.toHaveBeenCalled();
      });

      it('treats an explicitly emptied profile key as removal and reclassifies', async () => {
        const ws = { id: 1, settings: storedSettings() };
        (workspaceRepository.findOne as jest.Mock).mockResolvedValue(ws);
        (unitService.getUnitIdsByWorkspaceId as jest.Mock).mockResolvedValue([7]);

        await service.patchSettings(1, {
          unitMDProfile: '', itemMDProfile: ''
        } as WorkspaceSettingsDto);

        expect(ws.settings.unitMDProfile).toBe('');
        expect(unitMetadataService.patchMetadataCurrentProfile).toHaveBeenCalledWith(7, '', '');
      });

      it('does not reclassify when the same profile arrives in the retired spelling', async () => {
        const ws = { id: 1, settings: storedSettings() };
        (workspaceRepository.findOne as jest.Mock).mockResolvedValue(ws);
        (unitService.getUnitIdsByWorkspaceId as jest.Mock).mockResolvedValue([7]);

        await service.patchSettings(1, {
          unitMDProfile: 'https://raw.githubusercontent.com/iqb-vocabs/p11/master/unit.json',
          itemMDProfile: itemProfile
        } as WorkspaceSettingsDto);

        expect(unitMetadataService.patchMetadataCurrentProfile).not.toHaveBeenCalled();
        // ...but the stored spelling is still canonicalized
        expect(ws.settings.unitMDProfile).toBe(unitProfile);
      });

      it('reclassifies every unit and awaits it before saving on a real profile change', async () => {
        const calls: string[] = [];
        const ws = { id: 1, settings: storedSettings() };
        (workspaceRepository.findOne as jest.Mock).mockResolvedValue(ws);
        (unitService.getUnitIdsByWorkspaceId as jest.Mock).mockResolvedValue([7, 8]);
        (unitMetadataService.patchMetadataCurrentProfile as jest.Mock).mockImplementation(async () => {
          calls.push('reclassify');
        });
        (workspaceRepository.save as jest.Mock).mockImplementation(async () => {
          calls.push('save');
        });
        const newUnitProfile = 'https://w3id.org/iqb/p12/unit/';

        await service.patchSettings(1, { unitMDProfile: newUnitProfile } as WorkspaceSettingsDto);

        expect(unitMetadataService.patchMetadataCurrentProfile).toHaveBeenCalledTimes(2);
        // The item profile was not part of the request: the kept value is passed
        // on, so the unchanged side is not reclassified against ''.
        expect(unitMetadataService.patchMetadataCurrentProfile).toHaveBeenCalledWith(7, newUnitProfile, itemProfile);
        expect(unitMetadataService.patchMetadataCurrentProfile).toHaveBeenCalledWith(8, newUnitProfile, itemProfile);
        expect(calls).toEqual(['reclassify', 'reclassify', 'save']);
      });

      it('fails the request and does not save the settings when a reclassification fails', async () => {
        const ws = { id: 1, settings: storedSettings() };
        (workspaceRepository.findOne as jest.Mock).mockResolvedValue(ws);
        (unitService.getUnitIdsByWorkspaceId as jest.Mock).mockResolvedValue([7, 8]);
        (unitMetadataService.patchMetadataCurrentProfile as jest.Mock)
          .mockResolvedValueOnce(undefined)
          .mockRejectedValueOnce(new Error('db gone'));

        await expect(service.patchSettings(1, {
          unitMDProfile: 'https://w3id.org/iqb/p12/unit/'
        } as WorkspaceSettingsDto)).rejects.toThrow('db gone');

        expect(workspaceRepository.save).not.toHaveBeenCalled();
      });
    });
  });

  describe('getCodingReport', () => {
    afterEach(() => jest.restoreAllMocks());

    it('builds the report with CodingReportClass from the units of the workspace', async () => {
      const units = [{ id: 10, key: 'DLB007' }] as UnitPropertiesDto[];
      const rows = [{ unit: 'DLB007' }] as CodingReportDto[];
      (unitService.findAllWithProperties as jest.Mock).mockResolvedValue(units);
      const build = jest.spyOn(CodingReportClass, 'build').mockReturnValue(rows);

      const result = await service.getCodingReport(1);

      expect(unitService.findAllWithProperties).toHaveBeenCalledWith(1);
      expect(build).toHaveBeenCalledWith(1, units);
      expect(result).toBe(rows);
    });
  });
});
