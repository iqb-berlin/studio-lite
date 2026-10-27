import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { EntityManager, In, Repository } from 'typeorm';
import { UnitItemWithMetadataDto, UnitMetadataDto, UnitMetadataValues } from '@studio-lite-lib/api-dto';
import { UnitMetadataService } from './unit-metadata.service';
import UnitMetadata from '../entities/unit-metadata.entity';
import Unit from '../entities/unit.entity';
import Workspace from '../entities/workspace.entity';
import { UnitItemService } from './unit-item.service';
import { UnitMetadataToDeleteService } from './unit-metadata-to-delete.service';
import { MetadataProfileService } from './metadata-profile.service';

describe('UnitMetadataService', () => {
  let service: UnitMetadataService;
  let repository: Repository<UnitMetadata>;
  let unitsRepository: DeepMocked<Repository<Unit>>;
  let workspaceRepository: DeepMocked<Repository<Workspace>>;
  let unitItemService: DeepMocked<UnitItemService>;
  let unitMetadataToDeleteService: DeepMocked<UnitMetadataToDeleteService>;
  let metadataProfileService: DeepMocked<MetadataProfileService>;

  const mockRepository = {
    find: jest.fn(),
    findBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnitMetadataService,
        {
          provide: getRepositoryToken(UnitMetadata),
          useValue: mockRepository
        },
        {
          provide: getRepositoryToken(Unit),
          useValue: createMock<Repository<Unit>>()
        },
        {
          provide: getRepositoryToken(Workspace),
          useValue: createMock<Repository<Workspace>>()
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
          provide: MetadataProfileService,
          useValue: createMock<MetadataProfileService>()
        }
      ]
    }).compile();

    service = module.get<UnitMetadataService>(UnitMetadataService);
    repository = module.get<Repository<UnitMetadata>>(getRepositoryToken(UnitMetadata));
    unitsRepository = module.get(getRepositoryToken(Unit));
    workspaceRepository = module.get(getRepositoryToken(Workspace));
    unitItemService = module.get(UnitItemService);
    unitMetadataToDeleteService = module.get(UnitMetadataToDeleteService);
    metadataProfileService = module.get(MetadataProfileService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all unit metadata', async () => {
      const mockData = [{ id: 1, unitId: 1 }] as UnitMetadata[];
      mockRepository.find.mockResolvedValue(mockData);

      const result = await service.getAll();

      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });
  });

  describe('getAllByUnitId', () => {
    it('should return metadata for specific unit id', async () => {
      const unitId = 1;
      const mockData = [{ id: 1, unitId }] as UnitMetadata[];
      mockRepository.findBy.mockResolvedValue(mockData);

      const result = await service.getAllByUnitId(unitId);

      expect(repository.findBy).toHaveBeenCalledWith({ unitId });
      expect(result).toEqual(mockData);
    });
  });

  describe('getAllByUnitIds', () => {
    it('should return the profiles of all given units in one query', async () => {
      const mockData = [{ id: 1, unitId: 2 }, { id: 2, unitId: 3 }] as UnitMetadata[];
      mockRepository.findBy.mockResolvedValue(mockData);

      const result = await service.getAllByUnitIds([2, 3]);

      expect(repository.findBy).toHaveBeenCalledWith({ unitId: In([2, 3]) });
      expect(result).toEqual(mockData);
    });

    it('should not query for an empty list', async () => {
      mockRepository.findBy.mockClear();

      expect(await service.getAllByUnitIds([])).toEqual([]);
      expect(repository.findBy).not.toHaveBeenCalled();
    });
  });

  describe('addMetadata', () => {
    it('should add new metadata', async () => {
      const unitId = 1;
      const dto = {
        id: 0, profileId: 'profile1', key: 'key1', value: 'val1', unitId: 0
      } as UnitMetadataDto;
      const createdEntity = { ...dto, unitId, id: 123 } as UnitMetadata;

      mockRepository.create.mockReturnValue(createdEntity);
      mockRepository.save.mockResolvedValue(createdEntity);

      const result = await service.addMetadata(unitId, dto);

      expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({ profileId: 'profile1' }));
      expect(repository.save).toHaveBeenCalledWith(createdEntity);
      expect(result).toBe(123);
    });

    it('sets the NOT NULL columns and default order when the client omits them', async () => {
      // Regression: created_at/changed_at are NOT NULL without a DB default; the
      // profile form re-emits without them, so the INSERT must fill them or
      // Postgres rejects the row and the save crashes. `order` defaults to -1.
      const dto = { profileId: 'profile1' } as UnitMetadataDto;
      mockRepository.create.mockImplementation((value: UnitMetadata) => value);
      mockRepository.save.mockResolvedValue({ id: 5 } as UnitMetadata);

      await service.addMetadata(1, dto);

      expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({
        order: -1,
        createdAt: expect.any(Date),
        changedAt: expect.any(Date)
      }));
    });
  });

  describe('updateMetadata', () => {
    it('should update existing metadata', async () => {
      const id = 123;
      const dto = {
        id: 123, profileId: 'p1', key: 'k1', value: 'v2', unitId: 1
      } as UnitMetadataDto;

      mockRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.updateMetadata(id, dto);

      expect(repository.update).toHaveBeenCalledWith(
        id,
        expect.objectContaining({ profileId: 'p1', changedAt: expect.any(Date) })
      );
      expect(result).toBe(id);
    });

    it('should leave the row with its unit, whatever unitId the payload names (#1816)', async () => {
      mockRepository.update.mockResolvedValue({ affected: 1 });

      await service.updateMetadata(123, { id: 123, profileId: 'p1', unitId: 99 } as UnitMetadataDto);

      expect(repository.update).toHaveBeenCalledWith(123, expect.not.objectContaining({ unitId: 99 }));
    });
  });

  describe('removeMetadata', () => {
    it('should delete metadata by id', async () => {
      const id = 123;

      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.removeMetadata(id);

      expect(repository.delete).toHaveBeenCalledWith(id);
    });
  });

  // The row CRUD of this service is what the whole-metadata methods below call; spied on, so the
  // tests see which rows they write.
  describe('whole metadata of a unit', () => {
    let crud: {
      getAllByUnitId: jest.SpyInstance;
      updateMetadata: jest.SpyInstance;
      addMetadata: jest.SpyInstance;
      removeMetadata: jest.SpyInstance;
    };

    beforeEach(() => {
      crud = {
        getAllByUnitId: jest.spyOn(service, 'getAllByUnitId').mockResolvedValue([]),
        updateMetadata: jest.spyOn(service, 'updateMetadata').mockResolvedValue(0),
        addMetadata: jest.spyOn(service, 'addMetadata').mockResolvedValue(0),
        removeMetadata: jest.spyOn(service, 'removeMetadata').mockResolvedValue()
      };
    });

    describe('patchUnitMetadata', () => {
      it('should patch metadata', async () => {
        crud.getAllByUnitId.mockResolvedValue([]);
        await service.patchUnitMetadata(1, []);
        expect(crud.getAllByUnitId).toHaveBeenCalled();
      });

      it('updates the matching stored profile by profileId instead of re-inserting', async () => {
        // The incoming profile has no row id (the profile form drops it) but keeps
        // its profileId; it must update the stored row, not delete + re-insert.
        crud.getAllByUnitId.mockResolvedValue([
          { id: 7, profileId: 'p1' },
          { id: 8, profileId: 'p2' }
        ] as UnitMetadataDto[]);

        await service.patchUnitMetadata(1, [{ profileId: 'p1' } as UnitMetadataDto]);

        expect(crud.updateMetadata)
          .toHaveBeenCalledWith(7, expect.objectContaining({ id: 7, profileId: 'p1' }), undefined);
        expect(crud.addMetadata).not.toHaveBeenCalled();
        // p2 is gone from the incoming payload -> removed
        expect(crud.removeMetadata).toHaveBeenCalledWith(8, undefined);
      });

      it('inserts a profile that has no stored counterpart', async () => {
        crud.getAllByUnitId.mockResolvedValue([]);

        await service.patchUnitMetadata(1, [{ profileId: 'p-new' } as UnitMetadataDto]);

        expect(crud.addMetadata)
          .toHaveBeenCalledWith(1, expect.objectContaining({ profileId: 'p-new' }), undefined);
        expect(crud.removeMetadata).not.toHaveBeenCalled();
      });
    });

    describe('patchItemsMetadata', () => {
      it('should patch items', async () => {
        unitItemService.getAllByUnitIdWithMetadata.mockResolvedValue([]);
        await service.patchItemsMetadata(1, []);
        expect(unitItemService.getAllByUnitIdWithMetadata).toHaveBeenCalled();
      });

      it('should leave alone an item the unit does not have, neither updating nor creating it (#1816)', async () => {
        unitItemService.getAllByUnitIdWithMetadata
          .mockResolvedValue([{ uuid: 'own', id: 'item_1' } as UnitItemWithMetadataDto]);

        await service.patchItemsMetadata(1, [
          { uuid: 'own', id: 'item_1' } as UnitItemWithMetadataDto,
          { uuid: 'foreign', id: 'item_9' } as UnitItemWithMetadataDto
        ]);

        expect(unitItemService.updateItem).toHaveBeenCalledTimes(1);
        expect(unitItemService.updateItem).toHaveBeenCalledWith('own', expect.anything(), undefined);
        expect(unitItemService.addItem).not.toHaveBeenCalled();
        expect(unitItemService.removeItem).not.toHaveBeenCalled();
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
        crud.getAllByUnitId.mockResolvedValue([]);
        unitItemService.getAllByUnitIdWithMetadata.mockResolvedValue([]);

        await service.patchMetadata(1, { profiles: [], items: [] });

        expect(transaction).toHaveBeenCalled();
        expect(crud.getAllByUnitId).toHaveBeenCalledWith(1, manager);
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
        crud.getAllByUnitId.mockResolvedValue([]);
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

      it('canonicalizes a github profile id from the client to w3id and still flags it current (#1570)', async () => {
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
          settings: {
            unitMDProfile: 'https://w3id.org/iqb/p11/unit/',
            itemMDProfile: 'https://w3id.org/iqb/p11/item/'
          }
        } as unknown as Workspace);
        crud.getAllByUnitId.mockResolvedValue([]);
        unitItemService.getAllByUnitIdWithMetadata.mockResolvedValue([]);

        const patchUnitMetadataSpy = jest.spyOn(service, 'patchUnitMetadata').mockResolvedValue();
        const patchItemsMetadataSpy = jest.spyOn(service, 'patchItemsMetadata').mockResolvedValue();

        // a client still holding pre-#1570 state sends the github spelling
        await service.patchMetadata(1, {
          profiles: [{ profileId: 'https://raw.githubusercontent.com/iqb-vocabs/p11/master/unit.json' }],
          items: [{
            uuid: 'u-1',
            profiles: [{ profileId: 'https://raw.githubusercontent.com/iqb-vocabs/p11/master/item.json' }]
          }]
        });

        const savedProfiles = patchUnitMetadataSpy.mock.calls[0][1];
        expect(savedProfiles[0]).toMatchObject({ profileId: 'https://w3id.org/iqb/p11/unit/', order: 0 });
        const savedItems = patchItemsMetadataSpy.mock.calls[0][1];
        expect(savedItems[0].profiles[0]).toMatchObject({
          profileId: 'https://w3id.org/iqb/p11/item/',
          order: 0
        });
      });
    });

    describe('setCurrentProfiles', () => {
      it('should set current profile', () => {
        const metadata = {
          profiles: [{ profileId: 'p1' }, { profileId: 'p2' }],
          items: []
        } as UnitMetadataValues;
        const result = UnitMetadataService.setCurrentProfiles('p1', 'p2', metadata);
        expect(result.profiles[0].order).toBe(0);
        expect(result.profiles[1].order).toBe(-1);
      });

      // This is the single place that canonicalizes profile ids (#1570); it sits on
      // the units read (incl. the legacy unit.metadata blob the migration cannot
      // reach), the save, the unit copy and the import.
      it('rewrites github-spelled profile ids to w3id on unit and item level', () => {
        const metadata = {
          profiles: [{ profileId: 'https://raw.githubusercontent.com/iqb-vocabs/p11/master/unit.json' }],
          items: [{
            uuid: 'u-1',
            profiles: [{ profileId: 'https://raw.githubusercontent.com/iqb-vocabs/p11/master/item.json' }]
          }]
        } as unknown as UnitMetadataValues;

        const result = UnitMetadataService.setCurrentProfiles(
          'https://w3id.org/iqb/p11/unit/',
          'https://w3id.org/iqb/p11/item/',
          metadata
        );

        expect(result.profiles[0].profileId).toBe('https://w3id.org/iqb/p11/unit/');
        expect(result.items[0].profiles[0].profileId).toBe('https://w3id.org/iqb/p11/item/');
        // the canonical comparison still recognizes them as the configured profiles
        expect(result.profiles[0].order).toBe(0);
        expect(result.items[0].profiles[0].order).toBe(0);
      });

      it('leaves foreign profile ids untouched', () => {
        const metadata = {
          profiles: [{ profileId: 'https://example.org/own/profile.json' }]
        } as unknown as UnitMetadataValues;

        const result = UnitMetadataService.setCurrentProfiles('https://w3id.org/iqb/p11/unit/', '', metadata);

        expect(result.profiles[0].profileId).toBe('https://example.org/own/profile.json');
      });
    });

    describe('findOnesMetadata', () => {
      it('should return metadata', async () => {
        crud.getAllByUnitId.mockResolvedValue([]);
        unitItemService.getAllByUnitIdWithMetadata.mockResolvedValue([]);

        await service.findOnesMetadata(1);
        expect(crud.getAllByUnitId).toHaveBeenCalledWith(1);
      });
    });

    describe('buildHideNumberingMap', () => {
      it('extracts hideNumbering per entry from the stored profile definition', async () => {
        metadataProfileService.getStoredMetadataProfileFromDb.mockResolvedValue({
          id: 'p1',
          groups: [{
            entries: [
              { id: 'e1', parameters: { hideNumbering: true } },
              { id: 'e2', parameters: { hideNumbering: false } },
              { id: 'e3', parameters: null }
            ]
          }]
        } as never);

        const metadata = {
          profiles: [{ profileId: 'p1', entries: [] }],
          items: [{ id: 'i1', profiles: [{ profileId: 'p1', entries: [] }] }]
        } as unknown as UnitMetadataValues;

        const map = await service.buildHideNumberingMap(metadata);

        // only the flagged entry is recorded; false/null yield no entry
        expect(map).toEqual({ p1: { e1: true } });
        // the profile is looked up once even though two profiles reference it
        expect(metadataProfileService.getStoredMetadataProfileFromDb).toHaveBeenCalledTimes(1);
      });

      it('returns an empty map when the profile is not stored', async () => {
        metadataProfileService.getStoredMetadataProfileFromDb.mockResolvedValue(null);
        const metadata = { profiles: [{ profileId: 'p1', entries: [] }] } as unknown as UnitMetadataValues;
        await expect(service.buildHideNumberingMap(metadata)).resolves.toEqual({});
      });

      it('returns an empty map for undefined metadata', async () => {
        await expect(service.buildHideNumberingMap(undefined)).resolves.toEqual({});
      });

      it('reuses a shared profile cache across units so the profile is fetched once', async () => {
        metadataProfileService.getStoredMetadataProfileFromDb.mockResolvedValue({
          id: 'p1',
          groups: [{ entries: [{ id: 'e1', parameters: { hideNumbering: true } }] }]
        } as never);
        const cache = new Map();
        const metadata = { profiles: [{ profileId: 'p1', entries: [] }] } as unknown as UnitMetadataValues;

        await service.buildHideNumberingMap(metadata, cache);
        await service.buildHideNumberingMap(metadata, cache);

        expect(metadataProfileService.getStoredMetadataProfileFromDb).toHaveBeenCalledTimes(1);
      });
    });
  });
});
