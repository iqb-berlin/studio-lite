import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityManager, QueryFailedError, Repository } from 'typeorm';
import {
  CreateUnitDto,
  UnitMetadataDto,
  UnitMetadataValues,
  UnitPropertiesDto,
  UnitSchemeDto
} from '@studio-lite-lib/api-dto';
import { UnitService } from './unit.service';
import { UnitUserService } from './unit-user.service';
import { UnitCommentService } from './unit-comment.service';
import Unit from '../entities/unit.entity';
import UnitDefinition from '../entities/unit-definition.entity';
import WorkspaceUser from '../entities/workspace-user.entity';
import User from '../entities/user.entity';
import Workspace from '../entities/workspace.entity';
import UnitDropBoxHistory from '../entities/unit-drop-box-history.entity';
import { UnitMetadataService } from './unit-metadata.service';
import { UnitItemService } from './unit-item.service';
import { UnitMetadataToDeleteService } from './unit-metadata-to-delete.service';
import { UnitNotFoundException } from '../exceptions/unit-not-found.exception';

describe('UnitService', () => {
  let service: UnitService;
  let unitsRepository: DeepMocked<Repository<Unit>>;
  let unitDefinitionsRepository: DeepMocked<Repository<UnitDefinition>>;
  let usersRepository: DeepMocked<Repository<User>>;
  let workspaceUserRepository: DeepMocked<Repository<WorkspaceUser>>;
  let workspaceRepository: DeepMocked<Repository<Workspace>>;
  let unitUserService: DeepMocked<UnitUserService>;
  let unitCommentService: DeepMocked<UnitCommentService>;
  let unitMetadataService: DeepMocked<UnitMetadataService>;
  let unitItemService: DeepMocked<UnitItemService>;
  let unitMetadataToDeleteService: DeepMocked<UnitMetadataToDeleteService>;

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
          provide: getRepositoryToken(Unit),
          useValue: createMock<Repository<Unit>>()
        },
        {
          provide: getRepositoryToken(UnitDefinition),
          useValue: createMock<Repository<UnitDefinition>>()
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
    unitDefinitionsRepository = module.get(getRepositoryToken(UnitDefinition));
    usersRepository = module.get(getRepositoryToken(User));
    workspaceUserRepository = module.get(getRepositoryToken(WorkspaceUser));
    workspaceRepository = module.get(getRepositoryToken(Workspace));
    unitUserService = module.get(UnitUserService);
    unitCommentService = module.get(UnitCommentService);
    unitMetadataService = module.get(UnitMetadataService);
    unitItemService = module.get(UnitItemService);
    unitMetadataToDeleteService = module.get(UnitMetadataToDeleteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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

    it('should return properties', async () => {
      unitsRepository.findOne.mockResolvedValue({ id: 1, metadata: {} } as Unit);
      workspaceRepository.findOne.mockResolvedValue({ id: 1 } as Workspace);
      unitMetadataToDeleteService.getOneByUnit.mockResolvedValue(undefined);

      await service.findOnesProperties(1, 1);
      expect(unitsRepository.findOne).toHaveBeenCalled();
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

  describe('getUserDisplayName', () => {
    it('should format name', () => {
      const user = { firstName: 'John', lastName: 'Doe', name: 'user' } as User;
      expect(UnitService.getUserDisplayName(user)).toBe('Doe, John');
    });
  });

  describe('patchUnitMetadata', () => {
    it('should patch metadata', async () => {
      unitMetadataService.getAllByUnitId.mockResolvedValue([]);
      await service.patchUnitMetadata(1, []);
      expect(unitMetadataService.getAllByUnitId).toHaveBeenCalled();
    });

    it('updates the matching stored profile by profileId instead of re-inserting', async () => {
      // The incoming profile has no row id (the profile form drops it) but keeps
      // its profileId; it must update the stored row, not delete + re-insert.
      unitMetadataService.getAllByUnitId.mockResolvedValue([
        { id: 7, profileId: 'p1' },
        { id: 8, profileId: 'p2' }
      ] as UnitMetadataDto[]);

      await service.patchUnitMetadata(1, [{ profileId: 'p1' } as UnitMetadataDto]);

      expect(unitMetadataService.updateMetadata)
        .toHaveBeenCalledWith(7, expect.objectContaining({ id: 7, profileId: 'p1' }), undefined);
      expect(unitMetadataService.addMetadata).not.toHaveBeenCalled();
      // p2 is gone from the incoming payload -> removed
      expect(unitMetadataService.removeMetadata).toHaveBeenCalledWith(8, undefined);
    });

    it('inserts a profile that has no stored counterpart', async () => {
      unitMetadataService.getAllByUnitId.mockResolvedValue([]);

      await service.patchUnitMetadata(1, [{ profileId: 'p-new' } as UnitMetadataDto]);

      expect(unitMetadataService.addMetadata)
        .toHaveBeenCalledWith(1, expect.objectContaining({ profileId: 'p-new' }), undefined);
      expect(unitMetadataService.removeMetadata).not.toHaveBeenCalled();
    });
  });

  describe('patchItemsMetadata', () => {
    it('should patch items', async () => {
      unitItemService.getAllByUnitIdWithMetadata.mockResolvedValue([]);
      await service.patchItemsMetadata(1, []);
      expect(unitItemService.getAllByUnitIdWithMetadata).toHaveBeenCalled();
    });
  });

  describe('patchMetadata', () => {
    it('runs the whole save in one transaction and threads the manager through', async () => {
      const manager = createMock<EntityManager>();
      const transaction = jest.fn().mockImplementation(
        (runInTransaction: (m: EntityManager) => Promise<unknown>) => runInTransaction(manager)
      );
      Object.defineProperty(unitsRepository, 'manager', {
        value: { transaction } as unknown as EntityManager,
        configurable: true
      });
      unitsRepository.findOne.mockResolvedValue({ id: 1, workspaceId: 10 } as Unit);
      workspaceRepository.findOne.mockResolvedValue({ id: 10, settings: {} } as unknown as Workspace);
      unitMetadataService.getAllByUnitId.mockResolvedValue([]);
      unitItemService.getAllByUnitIdWithMetadata.mockResolvedValue([]);

      await service.patchMetadata(1, { profiles: [], items: [] });

      expect(transaction).toHaveBeenCalled();
      expect(unitMetadataService.getAllByUnitId).toHaveBeenCalledWith(1, manager);
      expect(unitItemService.getAllByUnitIdWithMetadata).toHaveBeenCalledWith(1, manager);
      expect(unitMetadataToDeleteService.upsertOneForUnit).toHaveBeenCalledWith(1, manager);
    });

    it('flags the current profile as order 0 from the workspace settings on save', async () => {
      const manager = createMock<EntityManager>();
      const transaction = jest.fn().mockImplementation(
        (runInTransaction: (m: EntityManager) => Promise<unknown>) => runInTransaction(manager)
      );
      Object.defineProperty(unitsRepository, 'manager', {
        value: { transaction } as unknown as EntityManager,
        configurable: true
      });
      unitsRepository.findOne.mockResolvedValue({ id: 1, workspaceId: 10 } as Unit);
      workspaceRepository.findOne.mockResolvedValue({
        id: 10,
        settings: { unitMDProfile: 'profile-a', itemMDProfile: 'profile-b' }
      } as unknown as Workspace);
      unitMetadataService.getAllByUnitId.mockResolvedValue([]);
      unitItemService.getAllByUnitIdWithMetadata.mockResolvedValue([]);

      const patchUnitMetadataSpy = jest.spyOn(service, 'patchUnitMetadata').mockResolvedValue();
      jest.spyOn(service, 'patchItemsMetadata').mockResolvedValue();

      await service.patchMetadata(1, {
        profiles: [{ profileId: 'profile-a' }, { profileId: 'other' }]
      });

      const savedProfiles = patchUnitMetadataSpy.mock.calls[0][1];
      expect(savedProfiles[0]).toMatchObject({ profileId: 'profile-a', order: 0 });
      expect(savedProfiles[1]).toMatchObject({ profileId: 'other', order: -1 });
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
  });

  describe('patchDropBoxHistory', () => {
    it('should patch workspace for drop box', async () => {
      const unit = { id: 1, key: 'k' } as Unit;
      // findOne is called in patchWorkspace for unit, then for existing unit check
      unitsRepository.findOne
        .mockResolvedValueOnce(unit) // First call: find unit
        .mockResolvedValueOnce(null); // Second call: find existing (return null to proceed)

      workspaceRepository.findOne.mockResolvedValue({ id: 2 } as Workspace);
      unitMetadataService.getAllByUnitId.mockResolvedValue([]);

      await service.patchDropBoxHistory([1], 2, 1, { id: 1 } as User);
      expect(unitsRepository.save).toHaveBeenCalled();
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
      // 4. findOnesDefinition -> unit
      // 5. patchDefinition -> unit
      // 6. findOnesScheme -> unit
      // 7. patchScheme -> unit
      unitsRepository.findOne
        .mockResolvedValueOnce(unit)
        .mockResolvedValueOnce(null)
        .mockResolvedValue(unit);

      unitsRepository.create.mockReturnValue({ id: 2 } as Unit);
      unitsRepository.save.mockResolvedValue({ id: 2 } as Unit);
      workspaceUserRepository.find.mockResolvedValue([]);
      usersRepository.findOne.mockResolvedValue({ firstName: 'F', lastName: 'L', name: 'N' } as User);
      unitDefinitionsRepository.findOne.mockResolvedValue({ data: 'xml' } as UnitDefinition);

      await service.copy([1], 2, { id: 1, name: 'u' } as User, false);
      expect(unitsRepository.create).toHaveBeenCalled();
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
      unitDefinitionsRepository.findOne.mockResolvedValue({ data: 'xml' } as UnitDefinition);

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

  describe('findOnesDefinition', () => {
    it('should return definition', async () => {
      unitsRepository.findOne.mockResolvedValue({ id: 1, workspaceId: 1 } as Unit);
      unitDefinitionsRepository.findOne.mockResolvedValue({ data: 'xml' } as UnitDefinition);

      const result = await service.findOnesDefinition(1);
      expect(result.definition).toBe('xml');
    });
  });

  describe('findOnesScheme', () => {
    it('should return scheme', async () => {
      unitsRepository.findOne.mockResolvedValue({ scheme: '{}', schemeType: 't' } as Unit);
      const result = await service.findOnesScheme(1);
      expect(result.scheme).toBe('{}');
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

  describe('patchDefinition', () => {
    it('should save definition', async () => {
      unitsRepository.findOne.mockResolvedValue({ id: 1 } as Unit);
      unitDefinitionsRepository.findOne.mockResolvedValue({ id: 1 } as UnitDefinition);

      await service.patchDefinition(1, { definition: 'xml' }, 'user', new Date());
      expect(unitDefinitionsRepository.save).toHaveBeenCalled();
      expect(unitsRepository.save).toHaveBeenCalled();
    });
  });

  describe('patchScheme', () => {
    it('should save scheme', async () => {
      unitsRepository.findOne.mockResolvedValue({ id: 1 } as Unit);
      await service.patchScheme(
        1,
        { scheme: '{"variableCodings": []}', schemeType: 't' } as UnitSchemeDto,
        'user',
        new Date()
      );
      expect(unitsRepository.save).toHaveBeenCalled();
    });
  });

  describe('setCurrentProfiles', () => {
    it('should set current profile', () => {
      const metadata = {
        profiles: [{ profileId: 'p1' }, { profileId: 'p2' }],
        items: []
      } as UnitMetadataValues;
      const result = UnitService.setCurrentProfiles('p1', 'p2', metadata);
      expect(result.profiles[0].order).toBe(0);
      expect(result.profiles[1].order).toBe(-1);
    });
  });

  describe('ensureValueAsText', () => {
    it('derives valueAsText from vocabulary entries (text, not label)', () => {
      const metadata = {
        profiles: [{
          profileId: 'p1',
          entries: [{
            id: 'e1',
            label: [{ lang: 'de', value: 'Prozess' }],
            value: [{ id: 'https://w3id.org/iqb/vocab/p2', text: [{ lang: 'de', value: 'Anwenden' }] }],
            valueAsText: []
          }]
        }]
      } as unknown as UnitMetadataValues;

      const result = UnitService.ensureValueAsText(metadata);

      expect(result.profiles[0].entries[0].valueAsText).toEqual([{ lang: 'de', value: 'Anwenden' }]);
    });

    it('tolerates a null element in a vocabulary value array without crashing', () => {
      const metadata = {
        profiles: [{
          profileId: 'p1',
          entries: [{
            id: 'e1',
            label: [],
            value: [{ id: 'v', text: [{ lang: 'de', value: 'Anwenden' }] }, null],
            valueAsText: []
          }]
        }]
      } as unknown as UnitMetadataValues;

      const result = UnitService.ensureValueAsText(metadata);

      expect(result.profiles[0].entries[0].valueAsText).toEqual([{ lang: 'de', value: 'Anwenden' }]);
    });

    it('keeps multilingual free text arrays as valueAsText', () => {
      const metadata = {
        profiles: [{
          profileId: 'p1',
          entries: [{
            id: 'e1',
            label: [],
            value: [{ lang: 'de', value: 'Freitext' }],
            valueAsText: []
          }]
        }]
      } as unknown as UnitMetadataValues;

      const result = UnitService.ensureValueAsText(metadata);

      expect(result.profiles[0].entries[0].valueAsText).toEqual([{ lang: 'de', value: 'Freitext' }]);
    });

    it('leaves valueAsText empty for a plain string value (not derivable)', () => {
      const metadata = {
        profiles: [{
          profileId: 'p1',
          entries: [{
            id: 'e1', label: [], value: 'false', valueAsText: []
          }]
        }]
      } as unknown as UnitMetadataValues;

      const result = UnitService.ensureValueAsText(metadata);

      expect(result.profiles[0].entries[0].valueAsText).toEqual([]);
    });

    it('does not overwrite an existing valueAsText', () => {
      const metadata = {
        profiles: [{
          profileId: 'p1',
          entries: [{
            id: 'e1',
            label: [],
            value: [{ id: 'v', text: [{ lang: 'de', value: 'Neu' }] }],
            valueAsText: [{ lang: 'de', value: 'Alt' }]
          }]
        }]
      } as unknown as UnitMetadataValues;

      const result = UnitService.ensureValueAsText(metadata);

      expect(result.profiles[0].entries[0].valueAsText).toEqual([{ lang: 'de', value: 'Alt' }]);
    });

    it('fills item profile entries and does not mutate the input', () => {
      const metadata = {
        items: [{
          id: 'ITEM1',
          profiles: [{
            profileId: 'ip1',
            entries: [{
              id: 'e1',
              label: [],
              value: [{ id: 'v', text: [{ lang: 'de', value: 'Anwenden' }] }],
              valueAsText: []
            }]
          }]
        }]
      } as unknown as UnitMetadataValues;

      const result = UnitService.ensureValueAsText(metadata);

      expect(result.items[0].profiles[0].entries[0].valueAsText).toEqual([{ lang: 'de', value: 'Anwenden' }]);
      // input untouched
      expect(metadata.items[0].profiles[0].entries[0].valueAsText).toEqual([]);
    });
  });

  describe('findOnesMetadata', () => {
    it('should return metadata', async () => {
      unitMetadataService.getAllByUnitId.mockResolvedValue([]);
      unitItemService.getAllByUnitIdWithMetadata.mockResolvedValue([]);

      await service.findOnesMetadata(1);
      expect(unitMetadataService.getAllByUnitId).toHaveBeenCalledWith(1);
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
