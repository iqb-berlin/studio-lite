import { Test, TestingModule } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateUnitDto,
  UnitFullMetadataDto,
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
  });

  describe('patchItemsMetadata', () => {
    it('should patch items', async () => {
      unitItemService.getAllByUnitIdWithMetadata.mockResolvedValue([]);
      await service.patchItemsMetadata(1, []);
      expect(unitItemService.getAllByUnitIdWithMetadata).toHaveBeenCalled();
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
      } as UnitFullMetadataDto;
      const result = UnitService.setCurrentProfiles('p1', 'p2', metadata);
      expect(result.profiles[0].isCurrent).toBe(true);
      expect(result.profiles[1].isCurrent).toBe(false);
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
});
