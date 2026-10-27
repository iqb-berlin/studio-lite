import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  EntityManager, In, QueryFailedError, Repository
} from 'typeorm';
import {
  CreateUnitDto,
  UnitItemDto,
  UnitMetadataDto,
  UnitPropertiesDto,
  UnitSchemeDto,
  UnitDefinitionDto
} from '@studio-lite-lib/api-dto';
import { UnitService } from './unit.service';
import { UnitUserService } from './unit-user.service';
import { UnitCommentService } from './unit-comment.service';
import Unit from '../entities/unit.entity';
import WorkspaceUser from '../entities/workspace-user.entity';
import User from '../entities/user.entity';
import Workspace from '../entities/workspace.entity';
import UnitDropBoxHistory from '../entities/unit-drop-box-history.entity';
import { UnitMetadataService } from './unit-metadata.service';
import { UnitItemService } from './unit-item.service';
import { UnitMetadataToDeleteService } from './unit-metadata-to-delete.service';
import { UnitDefinitionService } from './unit-definition.service';
import { UnitNotFoundException } from '../exceptions/unit-not-found.exception';
import { UnitKeyExistsException } from '../exceptions/unit-key-exists.exception';

describe('UnitService', () => {
  let service: UnitService;
  let unitsRepository: DeepMocked<Repository<Unit>>;
  let usersRepository: DeepMocked<Repository<User>>;
  let workspaceUserRepository: DeepMocked<Repository<WorkspaceUser>>;
  let workspaceRepository: DeepMocked<Repository<Workspace>>;
  let unitDropBoxHistoryRepository: DeepMocked<Repository<UnitDropBoxHistory>>;
  let unitUserService: DeepMocked<UnitUserService>;
  let unitCommentService: DeepMocked<UnitCommentService>;
  let unitMetadataService: DeepMocked<UnitMetadataService>;
  let unitItemService: DeepMocked<UnitItemService>;
  let unitMetadataToDeleteService: DeepMocked<UnitMetadataToDeleteService>;
  let unitDefinitionService: DeepMocked<UnitDefinitionService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnitService,
        {
          provide: UnitUserService,
          useValue: createMock<UnitUserService>()
        },
        {
          provide: UnitCommentService,
          useValue: createMock<UnitCommentService>()
        },
        {
          provide: UnitMetadataService,
          useValue: createMock<UnitMetadataService>()
        },
        {
          provide: UnitItemService,
          useValue: createMock<UnitItemService>()
        },
        {
          provide: UnitMetadataToDeleteService,
          useValue: createMock<UnitMetadataToDeleteService>()
        },
        {
          provide: UnitDefinitionService,
          useValue: createMock<UnitDefinitionService>()
        },
        {
          provide: getRepositoryToken(Unit),
          useValue: createMock<Repository<Unit>>()
        },
        {
          provide: getRepositoryToken(WorkspaceUser),
          useValue: createMock<Repository<WorkspaceUser>>()
        },
        {
          provide: getRepositoryToken(User),
          useValue: createMock<Repository<User>>()
        },
        {
          provide: getRepositoryToken(Workspace),
          useValue: createMock<Repository<Workspace>>()
        },
        {
          provide: getRepositoryToken(UnitDropBoxHistory),
          useValue: createMock<Repository<UnitDropBoxHistory>>()
        }
      ]
    }).compile();

    service = module.get<UnitService>(UnitService);
    unitsRepository = module.get(getRepositoryToken(Unit));
    usersRepository = module.get(getRepositoryToken(User));
    workspaceUserRepository = module.get(getRepositoryToken(WorkspaceUser));
    workspaceRepository = module.get(getRepositoryToken(Workspace));
    unitDropBoxHistoryRepository = module.get(getRepositoryToken(UnitDropBoxHistory));
    unitUserService = module.get(UnitUserService);
    unitCommentService = module.get(UnitCommentService);
    unitMetadataService = module.get(UnitMetadataService);
    unitItemService = module.get(UnitItemService);
    unitMetadataToDeleteService = module.get(UnitMetadataToDeleteService);
    unitDefinitionService = module.get(UnitDefinitionService);
  });

  describe('getUnitIdsByWorkspaceId', () => {
    it('should return unit ids', async () => {
      unitsRepository.find.mockResolvedValue([{ id: 1 } as Unit]);
      const result = await service.getUnitIdsByWorkspaceId(1);
      expect(result).toEqual([1]);
    });
  });

  describe('getAllUnits', () => {
    it('should return all units', async () => {
      unitsRepository.find.mockResolvedValue([]);
      expect(await service.getAllUnits()).toEqual([]);
    });
  });

  describe('findAll', () => {
    it('should return units with workspace name', async () => {
      unitsRepository.find.mockResolvedValue([{ workspaceId: 1 } as Unit]);
      workspaceRepository.find.mockResolvedValue([{ id: 1, name: 'ws' } as Workspace]);

      const result = await service.findAll();
      expect(result[0].workspaceName).toBe('ws');
    });
  });

  describe('findAllForGroup', () => {
    it('should return units for group', async () => {
      workspaceRepository.find.mockResolvedValue([{ id: 1, name: 'ws' } as Workspace]);
      unitsRepository.find.mockResolvedValue([{ workspaceId: 1 } as Unit]);

      const result = await service.findAllForGroup(1);
      expect(result[0].workspaceName).toBe('ws');
    });

    it('should return empty array if no workspaces', async () => {
      workspaceRepository.find.mockResolvedValue([]);
      expect(await service.findAllForGroup(1)).toEqual([]);
    });
  });

  describe('findAllForWorkspace', () => {
    it('should return units for workspace', async () => {
      unitsRepository.find.mockResolvedValue([{ id: 1 } as Unit]);
      unitCommentService.findOnesLastChangedComment.mockResolvedValue(null);
      unitUserService.findLastSeenCommentTimestamp.mockResolvedValue(new Date(0));

      const result = await service.findAllForWorkspace(1, 1, true);
      expect(unitCommentService.findOnesLastChangedComment).toHaveBeenCalledWith(1, 1);
      expect(result[0].lastSeenCommentChangedAt).toEqual(new Date(0));
    });
  });

  describe('isInWorkspace', () => {
    it('should ask for the unit in the workspace', async () => {
      unitsRepository.exists.mockResolvedValue(true);

      expect(await service.isInWorkspace(10, 3)).toBe(true);
      expect(unitsRepository.exists).toHaveBeenCalledWith({ where: { id: 10, workspaceId: 3 } });
    });

    it('should return false when the unit is not in the workspace', async () => {
      unitsRepository.exists.mockResolvedValue(false);

      expect(await service.isInWorkspace(10, 7)).toBe(false);
    });
  });

  describe('idsNotInWorkspace', () => {
    it('should return the ids the workspace does not hold', async () => {
      unitsRepository.find.mockResolvedValue([createMock<Unit>({ id: 10 })]);

      expect(await service.idsNotInWorkspace([10, 11, 10], 3)).toEqual([11]);
      expect(unitsRepository.find).toHaveBeenCalledWith({
        where: { id: In([10, 11]), workspaceId: 3 },
        select: ['id']
      });
    });

    it('should return nothing when all units are in the workspace', async () => {
      unitsRepository.find.mockResolvedValue([createMock<Unit>({ id: 10 }), createMock<Unit>({ id: 11 })]);

      expect(await service.idsNotInWorkspace([10, 11], 3)).toEqual([]);
    });

    it('should not ask the database for an empty list', async () => {
      expect(await service.idsNotInWorkspace([], 3)).toEqual([]);
      expect(unitsRepository.find).not.toHaveBeenCalled();
    });
  });

  describe('workspacesOfUnits', () => {
    it('should map each unit that exists to its workspace', async () => {
      unitsRepository.find.mockResolvedValue([
        createMock<Unit>({ id: 10, workspaceId: 3 }), createMock<Unit>({ id: 11, workspaceId: 4 })
      ]);

      expect(await service.workspacesOfUnits([10, 11, 12, 10])).toEqual(new Map([[10, 3], [11, 4]]));
      expect(unitsRepository.find).toHaveBeenCalledWith({
        where: { id: In([10, 11, 12]) },
        select: ['id', 'workspaceId']
      });
    });

    it('should not ask the database for an empty list', async () => {
      expect(await service.workspacesOfUnits([])).toEqual(new Map());
      expect(unitsRepository.find).not.toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create unit', async () => {
      unitsRepository.findOne.mockResolvedValue(null);
      unitsRepository.create.mockReturnValue({ id: 2 } as Unit);
      unitsRepository.save.mockResolvedValue({ id: 2 } as Unit);
      workspaceUserRepository.find.mockResolvedValue([]);
      usersRepository.findOne.mockResolvedValue({ lastName: 'Doe' } as User);

      const result = await service.create(1, { key: 'u1' } as CreateUnitDto, { id: 1 } as User, false);
      expect(result).toBe(2);
    });

    it('should create a new unit even when the body names an existing one', async () => {
      unitsRepository.findOne.mockResolvedValue(null);
      unitsRepository.create.mockReturnValue({ id: 2 } as Unit);
      unitsRepository.save.mockResolvedValue({ id: 2 } as Unit);
      workspaceUserRepository.find.mockResolvedValue([]);
      usersRepository.findOne.mockResolvedValue({ lastName: 'Doe' } as User);
      const body = { key: 'u1', id: 99 } as CreateUnitDto & { id: number };

      await service.create(1, body, { id: 1 } as User, false);

      expect(unitsRepository.create).toHaveBeenCalledWith(expect.objectContaining({ key: 'u1', id: undefined }));
    });

    it('should return 0 if unit exists', async () => {
      unitsRepository.findOne.mockResolvedValue({ id: 1 } as Unit);
      const result = await service.create(1, { key: 'u1' } as CreateUnitDto, { id: 1 } as User, false);
      expect(result).toBe(0);
    });

    it('should assign a uuid to the new unit', async () => {
      const newUnit: Partial<Unit> = { id: 2 };
      unitsRepository.findOne.mockResolvedValue(null);
      unitsRepository.create.mockReturnValue(newUnit as Unit);
      unitsRepository.save.mockResolvedValue(newUnit as Unit);
      workspaceUserRepository.find.mockResolvedValue([]);
      usersRepository.findOne.mockResolvedValue({ lastName: 'Doe' } as User);

      await service.create(1, { key: 'u1' } as CreateUnitDto, { id: 1 } as User, false);

      expect(newUnit.uuid).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });
  });

  describe('findOnesProperties', () => {
    it('should throw if not found', async () => {
      unitsRepository.findOne.mockResolvedValue(null);
      await expect(service.findOnesProperties(1, 1)).rejects.toThrow(UnitNotFoundException);
    });

    it('should return properties with the metadata UnitMetadataService reads for them', async () => {
      const unit = { id: 1, metadata: {} } as Unit;
      const workspace = { id: 1 } as Workspace;
      unitsRepository.findOne.mockResolvedValue(unit);
      workspaceRepository.findOne.mockResolvedValue(workspace);
      unitMetadataService.getModifiedMetadataForUnit.mockResolvedValue(unit);

      const result = await service.findOnesProperties(1, 1);

      expect(unitsRepository.findOne).toHaveBeenCalled();
      expect(unitMetadataService.getModifiedMetadataForUnit).toHaveBeenCalledWith(unit, workspace);
      expect(result).toBe(unit);
    });
  });

  describe('findAllWithProperties', () => {
    it('should return units', async () => {
      workspaceRepository.findOne.mockResolvedValue({ id: 1 } as Workspace);
      unitsRepository.find.mockResolvedValue([{ id: 1, metadata: {} } as Unit]);

      const result = await service.findAllWithProperties(1);
      expect(result).toHaveLength(1);
    });
  });

  describe('findAllExportSources', () => {
    it('reads the metadata column of an unmarked unit without resolving profiles', async () => {
      const metadata = { profiles: [{ profileId: 'p', entries: [] }], items: [] };
      unitsRepository.find.mockResolvedValue([{ id: 1, metadata, scheme: '{}' } as unknown as Unit]);
      unitMetadataToDeleteService.findMarkedUnitIds.mockResolvedValue(new Set());
      unitMetadataService.getAllByUnitIds.mockResolvedValue([]);
      unitItemService.getAllByUnitIds.mockResolvedValue([]);

      const result = await service.findAllExportSources(4);

      expect(result).toEqual([{ id: 1, metadata, scheme: '{}' }]);
      expect(unitsRepository.find).toHaveBeenCalledWith({
        where: { workspaceId: 4 },
        select: ['id', 'metadata', 'scheme']
      });
      expect(unitMetadataService.buildHideNumberingMap).not.toHaveBeenCalled();
    });

    it('reads the metadata tables of the marked units, as the export does, in one query each', async () => {
      unitsRepository.find.mockResolvedValue([
        { id: 2, metadata: { stale: true }, scheme: '' },
        { id: 3, metadata: { stale: true }, scheme: '' },
        { id: 5, metadata: { profiles: [] }, scheme: '' }
      ] as unknown as Unit[]);
      unitMetadataToDeleteService.findMarkedUnitIds.mockResolvedValue(new Set([2, 3]));
      unitMetadataService.getAllByUnitIds.mockResolvedValue([{ unitId: 2, profileId: 'p' } as UnitMetadataDto]);
      unitItemService.getAllByUnitIds.mockResolvedValue([{ unitId: 3, id: 'item1' } as UnitItemDto]);

      const result = await service.findAllExportSources(4);

      expect(result).toEqual([
        { id: 2, metadata: { profiles: [{ unitId: 2, profileId: 'p' }], items: [] }, scheme: '' },
        { id: 3, metadata: { profiles: [], items: [{ unitId: 3, id: 'item1' }] }, scheme: '' },
        { id: 5, metadata: { profiles: [] }, scheme: '' }
      ]);
      expect(unitMetadataToDeleteService.findMarkedUnitIds).toHaveBeenCalledWith([2, 3, 5]);
      expect(unitMetadataService.getAllByUnitIds).toHaveBeenCalledWith([2, 3]);
      expect(unitItemService.getAllByUnitIds).toHaveBeenCalledWith([2, 3]);
      expect(unitMetadataToDeleteService.getOneByUnit).not.toHaveBeenCalled();
      expect(unitItemService.getAllByUnitIdWithMetadata).not.toHaveBeenCalled();
    });
  });

  describe('getUserDisplayName', () => {
    it('should format name', () => {
      const user = { firstName: 'John', lastName: 'Doe', name: 'user' } as User;
      expect(UnitService.getUserDisplayName(user)).toBe('Doe, John');
    });
  });

  describe('patchUnit', () => {
    it('should patch unit props', async () => {
      const unit = { id: 1 } as Unit;
      unitsRepository.findOne.mockResolvedValue(unit);

      await service.patchUnit(1, { name: 'n' } as UnitPropertiesDto, 'user');
      expect(unit.name).toBe('n');
      expect(unitsRepository.save).toHaveBeenCalled();
    });

    // #1842: renaming did not check what creating and copying refuse
    describe('with a new key', () => {
      beforeEach(() => {
        unitsRepository.findOne.mockResolvedValue({ id: 1, key: 'OLD', workspaceId: 7 } as Unit);
        unitsRepository.find.mockResolvedValue([
          { id: 1, key: 'OLD' }, { id: 2, key: 'M1_001' }
        ] as Unit[]);
      });

      it.each(['M1_001', 'm1_001', ' M1_001 '])('refuses %p, which another unit carries', async key => {
        await expect(service.patchUnit(1, { id: 1, key } as UnitPropertiesDto, 'user'))
          .rejects.toBeInstanceOf(UnitKeyExistsException);
        expect(unitsRepository.find).toHaveBeenCalledWith(expect.objectContaining({ where: { workspaceId: 7 } }));
        expect(unitsRepository.save).not.toHaveBeenCalled();
      });

      it('takes a key no other unit carries', async () => {
        await service.patchUnit(1, { id: 1, key: 'M1_002' } as UnitPropertiesDto, 'user');

        expect(unitsRepository.save).toHaveBeenCalledWith(expect.objectContaining({ key: 'M1_002' }));
      });

      it('lets a unit keep or recase its own key', async () => {
        await service.patchUnit(1, { id: 1, key: 'old' } as UnitPropertiesDto, 'user');

        expect(unitsRepository.save).toHaveBeenCalledWith(expect.objectContaining({ key: 'old' }));
      });

      it('does not look at the other keys when the key is sent unchanged', async () => {
        await service.patchUnit(1, { id: 1, key: 'OLD', name: 'n' } as UnitPropertiesDto, 'user');

        expect(unitsRepository.find).not.toHaveBeenCalled();
        expect(unitsRepository.save).toHaveBeenCalled();
      });
    });
  });

  describe('patchDropBoxHistory', () => {
    it('should patch workspace for drop box', async () => {
      const unit = { id: 1, key: 'k' } as Unit;
      // findOne is called in patchWorkspace for unit, then for existing unit check
      unitsRepository.findOne
        .mockResolvedValueOnce(unit) // First call: find unit
        .mockResolvedValueOnce(null); // Second call: find existing (return null to proceed)

      workspaceRepository.findOne.mockResolvedValue({ id: 2 } as Workspace);

      await service.patchDropBoxHistory([1], 2, 1, { id: 1 } as User);
      expect(unitMetadataService.patchMetadataCurrentProfile).toHaveBeenCalledWith(1, undefined, undefined);
      expect(unitsRepository.save).toHaveBeenCalled();
    });
  });

  describe('patchReturnDropBoxHistory', () => {
    beforeEach(() => {
      unitsRepository.findOne.mockImplementation(async ({ where }) => {
        const { id, key } = where as { id?: number; key?: string };
        if (key) return null; // no unit of the same key in the source
        return { id, key: id === 1 ? 'SUBMITTED' : 'NEVER' } as Unit;
      });
      unitDropBoxHistoryRepository.findOne.mockImplementation(async ({ where }) => (
        (where as { unitId: number }).unitId === 1 ?
          { unitId: 1, sourceWorkspaceId: 5, targetWorkspaceId: 9 } as UnitDropBoxHistory :
          null
      ));
      workspaceRepository.findOne.mockResolvedValue({ id: 5 } as Workspace);
    });

    it('should return a submitted unit to where it came from', async () => {
      const report = await service.patchReturnDropBoxHistory([1], 9, { id: 1 } as User);

      expect(report.messages).toEqual([]);
      expect(unitsRepository.save).toHaveBeenCalledWith(expect.objectContaining({ id: 1, workspaceId: 5 }));
      expect(unitDropBoxHistoryRepository.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          unitId: 1, sourceWorkspaceId: 5, targetWorkspaceId: 9, returned: true
        }),
        ['unitId', 'sourceWorkspaceId', 'targetWorkspaceId']
      );
    });

    // #1793: a unit created in the drop box, or moved into it, has no submission to undo
    it('should report a unit that was never submitted, and return the others', async () => {
      const report = await service.patchReturnDropBoxHistory([1, 2], 9, { id: 1 } as User);

      expect(report.messages).toEqual([{ objectKey: 'NEVER', messageKey: 'unit-patch.not-submitted' }]);
      expect(unitsRepository.save).toHaveBeenCalledTimes(1);
      expect(unitsRepository.save).toHaveBeenCalledWith(expect.objectContaining({ id: 1, workspaceId: 5 }));
      expect(unitDropBoxHistoryRepository.upsert).toHaveBeenCalledTimes(1);
    });

    // #1806: an older, already returned submission from another workspace must not decide the target
    it('should look for the latest submission not yet returned', async () => {
      await service.patchReturnDropBoxHistory([1], 9, { id: 1 } as User);

      expect(unitDropBoxHistoryRepository.findOne).toHaveBeenCalledWith({
        where: { unitId: 1, targetWorkspaceId: 9, returned: false },
        order: { changedAt: 'DESC' }
      });
    });
  });

  describe('copy', () => {
    it('should copy units', async () => {
      const unit = {
        id: 1,
        key: 'k',
        scheme: '{"variableCodings": []}',
        variables: []
      } as unknown as Unit;

      // Sequence:
      // 1. copy: findOne -> unit
      // 2. create: findOne(existing) -> null
      // 3. create: findOne(source) -> unit
      // Definition and scheme are copied through UnitDefinitionService.
      unitsRepository.findOne
        .mockResolvedValueOnce(unit)
        .mockResolvedValueOnce(null)
        .mockResolvedValue(unit);

      unitsRepository.create.mockReturnValue({ id: 2 } as Unit);
      unitsRepository.save.mockResolvedValue({ id: 2 } as Unit);
      workspaceUserRepository.find.mockResolvedValue([]);
      usersRepository.findOne.mockResolvedValue({ firstName: 'F', lastName: 'L', name: 'N' } as User);
      unitMetadataService.getMetadataOfUnit.mockResolvedValue({ profiles: [], items: [] });
      unitDefinitionService.findOnesDefinition.mockResolvedValue({ definition: 'xml' } as UnitDefinitionDto);
      unitDefinitionService.findOnesScheme.mockResolvedValue({ scheme: '{"variableCodings": []}' } as UnitSchemeDto);

      await service.copy([1], 2, { id: 1, name: 'u' } as User, false);
      expect(unitsRepository.create).toHaveBeenCalled();
      expect(unitDefinitionService.findOnesDefinition).toHaveBeenCalledWith(1);
      expect(unitDefinitionService.patchDefinition)
        .toHaveBeenCalledWith(2, { definition: 'xml' }, undefined, null);
      expect(unitDefinitionService.patchScheme)
        .toHaveBeenCalledWith(2, { scheme: '{"variableCodings": []}' }, undefined, null);
      expect(unitMetadataService.copyItemsWithMetadata).toHaveBeenCalledWith(2, { profiles: [], items: [] });
    });

    it('should not copy uuid to the new unit', async () => {
      const sourceUnit = {
        id: 1,
        key: 'k',
        uuid: 'original-uuid',
        scheme: '{"variableCodings": []}',
        variables: []
      } as unknown as Unit;

      unitsRepository.findOne
        .mockResolvedValueOnce(sourceUnit)
        .mockResolvedValueOnce(null)
        .mockResolvedValue(sourceUnit);

      const capturedCreateArg: Partial<Unit> = {};
      unitsRepository.create.mockImplementation((dto: Partial<Unit>) => {
        Object.assign(capturedCreateArg, dto);
        return { id: 2 } as Unit;
      });
      unitsRepository.save.mockResolvedValue({ id: 2 } as Unit);
      workspaceUserRepository.find.mockResolvedValue([]);
      usersRepository.findOne.mockResolvedValue({ firstName: 'F', lastName: 'L', name: 'N' } as User);
      unitMetadataService.getMetadataOfUnit.mockResolvedValue({ profiles: [], items: [] });
      unitDefinitionService.findOnesDefinition.mockResolvedValue({ definition: 'xml' } as UnitDefinitionDto);
      unitDefinitionService.findOnesScheme.mockResolvedValue({ scheme: '{"variableCodings": []}' } as UnitSchemeDto);

      await service.copy([1], 2, { id: 1, name: 'u' } as User, false);

      expect(capturedCreateArg.uuid).toBeUndefined();
    });
  });

  describe('remove', () => {
    it('should remove unit', async () => {
      await service.remove(1);
      expect(unitsRepository.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('patchUnitGroup', () => {
    it('should update group', async () => {
      await service.patchUnitGroup(1, 'group', [1]);
      expect(unitsRepository.update).toHaveBeenCalledTimes(2);
    });
  });

  describe('removeUnitState', () => {
    it('should reset state', async () => {
      unitsRepository.findOne.mockResolvedValue({ id: 1, state: '1' } as Unit);
      await service.removeUnitState(1);
      expect(unitsRepository.save).toHaveBeenCalled();
    });
  });

  describe('ensureUuid', () => {
    const setupTransaction = (unit: Unit | null) => {
      const mockManager = createMock<EntityManager>();
      mockManager.findOne.mockResolvedValue(unit);
      const transaction = jest.fn().mockImplementation(
        (cb: (manager: EntityManager) => Promise<string>) => cb(mockManager)
      );
      Object.defineProperty(unitsRepository, 'manager', {
        value: { transaction },
        configurable: true
      });
      return mockManager;
    };

    it('should return existing uuid without saving', async () => {
      const mockManager = setupTransaction({ id: 1, uuid: 'existing-uuid' } as Unit);

      const result = await service.ensureUuid(1);

      expect(result).toBe('existing-uuid');
      expect(mockManager.save).not.toHaveBeenCalled();
    });

    it('should generate, persist and return uuid when none exists', async () => {
      const mockManager = setupTransaction({ id: 1, uuid: null } as Unit);
      mockManager.save.mockResolvedValue({ id: 1 } as Unit);

      const result = await service.ensureUuid(1);

      expect(result).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
      expect(mockManager.save).toHaveBeenCalled();
    });

    it('should throw UnitNotFoundException when unit does not exist', async () => {
      setupTransaction(null);

      await expect(service.ensureUuid(999)).rejects.toThrow(UnitNotFoundException);
    });
  });

  describe('adoptUuidIfFree', () => {
    it('should adopt the uuid when no other unit holds it', async () => {
      (unitsRepository.findOne as jest.Mock).mockResolvedValue(null);

      await service.adoptUuidIfFree(1, 'imported-uuid');

      expect(unitsRepository.update).toHaveBeenCalledWith(1, { uuid: 'imported-uuid' });
    });

    it('should keep none when another unit already holds the uuid', async () => {
      (unitsRepository.findOne as jest.Mock).mockResolvedValue({ id: 2 } as Unit);

      await service.adoptUuidIfFree(1, 'taken-uuid');

      expect(unitsRepository.update).not.toHaveBeenCalled();
    });

    it('should silently swallow a unique constraint violation from a concurrent import', async () => {
      const warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
      (unitsRepository.findOne as jest.Mock).mockResolvedValue(null);
      (unitsRepository.update as jest.Mock).mockRejectedValue(
        new QueryFailedError('UPDATE', [], Object.assign(new Error('duplicate key'), { code: '23505' }))
      );

      await expect(service.adoptUuidIfFree(1, 'raced-uuid')).resolves.toBeUndefined();

      expect(warnSpy).not.toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('should warn about other update failures instead of hiding them', async () => {
      const warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
      (unitsRepository.findOne as jest.Mock).mockResolvedValue(null);
      (unitsRepository.update as jest.Mock).mockRejectedValue(new Error('connection lost'));

      await expect(service.adoptUuidIfFree(1, 'imported-uuid')).resolves.toBeUndefined();

      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('connection lost'));
      warnSpy.mockRestore();
    });
  });
});
