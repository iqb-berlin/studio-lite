import { TestBed } from '@angular/core/testing';
import { signal, WritableSignal } from '@angular/core';
import { of, Subject } from 'rxjs';
import {
  UnitInListDto,
  UnitPropertiesDto,
  WorkspaceGroupFullDto,
  AuthDataDto
} from '@studio-lite-lib/api-dto';
import { AbstractControl } from '@angular/forms';
import { WorkspaceService } from './workspace.service';
import { WorkspaceBackendService } from './workspace-backend.service';
import { AppService } from '../../../services/app.service';
import { RichNoteTagsService } from './rich-note-tags.service';
import { UnitStoresService } from './unit-stores.service';
import { UnitMetadataStore } from '../classes/unit-metadata-store';
import { UnitDefinitionStore } from '../classes/unit-definition-store';
import { UnitSchemeStore } from '../classes/unit-scheme-store';

describe('WorkspaceService', () => {
  let service: WorkspaceService;
  let backendService: jest.Mocked<WorkspaceBackendService>;
  let appService: jest.Mocked<AppService>;
  let richNoteTagsService: jest.Mocked<RichNoteTagsService>;
  let unitStores: {
    metadataStore: WritableSignal<UnitMetadataStore | undefined>;
    definitionStore: WritableSignal<UnitDefinitionStore | undefined>;
    schemeStore: WritableSignal<UnitSchemeStore | undefined>;
    metadataLoaded$: Subject<UnitPropertiesDto>;
    loadMetadataStore: jest.Mock;
    reset: jest.Mock;
  };

  const mockAuthData: AuthDataDto = {
    userId: 1,
    userName: 'testuser',
    userLongName: 'Test User',
    isAdmin: false,
    workspaces: [],
    reviews: []
  };

  beforeEach(() => {
    const backendServiceMock = {
      getWorkspaceGroupStates: jest.fn(),
      getUnitList: jest.fn(),
      getUnitProperties: jest.fn(),
      setUnitProperties: jest.fn(),
      setUnitDefinition: jest.fn(),
      setUnitScheme: jest.fn(),
      getUnitRichNoteTags: jest.fn()
    };

    const appServiceMock = {
      authData: mockAuthData,
      dataLoading: false
    };

    const richNoteTagsServiceMock = {
      tags: [],
      tags$: of([]),
      loadTags: jest.fn(),
      getTagLabel: jest.fn().mockReturnValue([])
    };

    unitStores = {
      metadataStore: signal(undefined),
      definitionStore: signal(undefined),
      schemeStore: signal(undefined),
      metadataLoaded$: new Subject<UnitPropertiesDto>(),
      loadMetadataStore: jest.fn(),
      reset: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        WorkspaceService,
        { provide: WorkspaceBackendService, useValue: backendServiceMock },
        { provide: AppService, useValue: appServiceMock },
        { provide: RichNoteTagsService, useValue: richNoteTagsServiceMock },
        { provide: UnitStoresService, useValue: unitStores }
      ]
    });

    service = TestBed.inject(WorkspaceService);
    backendService = TestBed.inject(WorkspaceBackendService) as jest.Mocked<WorkspaceBackendService>;
    appService = TestBed.inject(AppService) as jest.Mocked<AppService>;
    richNoteTagsService = TestBed.inject(RichNoteTagsService) as jest.Mocked<RichNoteTagsService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initialization', () => {
    it('should initialize with default values', () => {
      expect(service.selectedWorkspaceId).toBe(0);
      expect(service.selectedWorkspaceName).toBe('');
      expect(service.isWorkspaceGroupAdmin).toBe(false);
      expect(service.userAccessLevel).toBe(0);
      expect(service.unitList).toEqual({});
      expect(service.workspaceSettings).toBeDefined();
      expect(service.workspaceSettings.defaultEditor).toBe('');
      expect(service.workspaceSettings.defaultPlayer).toBe('');
    });

    it('should have a selectedUnit$ observable with initial value 0', done => {
      service.selectedUnit$.subscribe(value => {
        expect(value).toBe(0);
        done();
      });
    });

    it('should have isValidFormKey BehaviorSubject with initial value true', done => {
      service.isValidFormKey.subscribe(value => {
        expect(value).toBe(true);
        done();
      });
    });
  });

  describe('unitKeyPatternString', () => {
    it('should return correct pattern string', () => {
      const pattern = WorkspaceService.unitKeyPatternString();
      expect(pattern).toBe('[a-zA-Z][a-zA-Z0-9_-]*');
    });
  });

  describe('unitKeyUniquenessValidator', () => {
    const unitList: { [key: string]: UnitInListDto[] } = {
      Group1: [
        { id: 1, key: 'UNIT1', name: 'Unit 1' },
        { id: 2, key: 'UNIT2', name: 'Unit 2' }
      ],
      Group2: [
        { id: 3, key: 'UNIT3', name: 'Unit 3' }
      ]
    };

    it('should return null for unique key', () => {
      const validator = WorkspaceService.unitKeyUniquenessValidator(0, () => unitList);
      const control = { value: 'NEWUNIT' } as AbstractControl;
      const result = validator(control);
      expect(result).toBeNull();
    });

    // the workspace replaces its list object when it loads; one taken earlier was empty (#1842)
    it('should check against the list as it is when the key is checked', () => {
      let currentList: { [key: string]: UnitInListDto[] } = {};
      const validator = WorkspaceService.unitKeyUniquenessValidator(0, () => currentList);
      currentList = unitList;

      expect(validator({ value: 'UNIT3' } as AbstractControl)).not.toBeNull();
    });

    it('should return error for duplicate key (case insensitive)', () => {
      const validator = WorkspaceService.unitKeyUniquenessValidator(0, () => unitList);
      const control = { value: 'unit1' } as AbstractControl;
      const result = validator(control);
      expect(result).toEqual({
        keyNotUnique: 'Der Kurzname muss eindeutig innerhalb des Arbeitsbereiches sein.'
      });
    });

    it('should allow same key for same unit', () => {
      const validator = WorkspaceService.unitKeyUniquenessValidator(1, () => unitList);
      const control = { value: 'UNIT1' } as AbstractControl;
      const result = validator(control);
      expect(result).toBeNull();
    });

    it('should trim whitespace when checking uniqueness', () => {
      const validator = WorkspaceService.unitKeyUniquenessValidator(0, () => unitList);
      const control = { value: '  UNIT2  ' } as AbstractControl;
      const result = validator(control);
      expect(result).not.toBeNull();
    });
  });

  describe('resetUnitData', () => {
    it('should reset the timestamps and let go of the stores', () => {
      service.lastChangedMetadata = new Date();
      service.lastChangedScheme = new Date();
      service.lastChangedDefinition = new Date();
      service.isValidFormKey.next(false);
      service.setUnitKeyTaken(true);

      service.resetUnitData();

      expect(service.isValidFormKey.value).toBe(true);
      expect(service.unitKeyTaken()).toBe(false);
      expect(service.lastChangedMetadata).toBeUndefined();
      expect(service.lastChangedScheme).toBeUndefined();
      expect(service.lastChangedDefinition).toBeUndefined();
      expect(unitStores.reset).toHaveBeenCalled();
    });
  });

  describe('resetUnitList', () => {
    it('should organize units by group', () => {
      const units: UnitInListDto[] = [
        {
          id: 1, key: 'u1', name: 'Unit 1', groupName: 'Group A'
        },
        {
          id: 2, key: 'u2', name: 'Unit 2', groupName: 'Group A'
        },
        {
          id: 3, key: 'u3', name: 'Unit 3', groupName: 'Group B'
        }
      ];

      service.resetUnitList(units);

      expect(service.unitList['Group A']).toHaveLength(2);
      expect(service.unitList['Group B']).toHaveLength(1);
      expect(service.unitList['Group A'][0].id).toBe(1);
      expect(service.unitList['Group B'][0].id).toBe(3);
    });

    it('should handle units without group (empty string key)', () => {
      const units: UnitInListDto[] = [
        { id: 1, key: 'u1', name: 'Unit 1' },
        {
          id: 2, key: 'u2', name: 'Unit 2', groupName: ''
        }
      ];

      service.resetUnitList(units);

      expect(service.unitList['']).toHaveLength(2);
    });

    it('should create empty groups from workspace settings', () => {
      service.workspaceSettings.unitGroups = ['Empty Group 1', 'Empty Group 2'];
      const units: UnitInListDto[] = [];

      service.resetUnitList(units);

      expect(service.unitList['Empty Group 1']).toEqual([]);
      expect(service.unitList['Empty Group 2']).toEqual([]);
    });

    it('should not duplicate groups that have units', () => {
      service.workspaceSettings.unitGroups = ['Group A', 'Empty Group'];
      const units: UnitInListDto[] = [
        {
          id: 1, key: 'u1', name: 'Unit 1', groupName: 'Group A'
        }
      ];

      service.resetUnitList(units);

      expect(service.unitList['Group A']).toHaveLength(1);
      expect(service.unitList['Empty Group']).toEqual([]);
    });
  });

  describe('setWorkspaceGroupStates', () => {
    it('should fetch and set workspace group states and rich note tags', () => {
      const mockStates = [
        {
          id: 1, label: 'Draft', value: 'draft', color: '#cccccc'
        }
      ];
      const mockTags = [
        {
          id: 'tag1', label: [{ lang: 'de', value: 'Tag 1' }]
        }
      ];
      const mockResponse: WorkspaceGroupFullDto = {
        id: 1,
        name: 'Test Group',
        settings: {
          states: mockStates,
          defaultEditor: '',
          defaultPlayer: '',
          defaultSchemer: '',
          richNoteTags: mockTags
        }
      };

      service.groupId = 1;
      backendService.getWorkspaceGroupStates.mockReturnValue(of(mockResponse));

      service.setWorkspaceGroupStates();

      expect(backendService.getWorkspaceGroupStates).toHaveBeenCalledWith(1);
      expect(service.workspaceSettings.states).toEqual(mockStates);
      expect(service.workspaceSettings.richNoteTags).toEqual(mockTags);
    });

    it('should not fetch when groupId is not set', () => {
      service.groupId = 0;

      service.setWorkspaceGroupStates();

      expect(backendService.getWorkspaceGroupStates).not.toHaveBeenCalled();
    });

    it('should handle response without settings', () => {
      const mockResponse: WorkspaceGroupFullDto = {
        id: 1,
        name: 'Test Group'
      };

      service.groupId = 1;
      backendService.getWorkspaceGroupStates.mockReturnValue(of(mockResponse));

      service.setWorkspaceGroupStates();

      expect(service.states).toEqual([]);
    });
  });

  describe('loadUnitProperties', () => {
    it('should load the metadata store of the selected unit', done => {
      const store = new UnitMetadataStore({ id: 5 });
      unitStores.loadMetadataStore.mockReturnValue(of(store));
      service.selectedWorkspaceId = 1;
      service.selectedUnit$.next(5);

      service.loadUnitProperties().subscribe(loaded => {
        expect(loaded).toBe(store);
        expect(unitStores.loadMetadataStore).toHaveBeenCalledWith(1, 5);
        done();
      });
    });
  });

  describe('freshly loaded unit properties', () => {
    it('should take who changed which part when', () => {
      unitStores.metadataLoaded$.next({
        id: 1,
        lastChangedMetadata: new Date('2024-01-01'),
        lastChangedMetadataUser: 'User 1',
        lastChangedDefinition: new Date('2024-01-02'),
        lastChangedDefinitionUser: 'User 2',
        lastChangedScheme: new Date('2024-01-03'),
        lastChangedSchemeUser: 'User 3'
      });

      expect(service.lastChangedMetadata).toEqual(new Date('2024-01-01'));
      expect(service.lastChangedMetadataUser).toBe('User 1');
      expect(service.lastChangedDefinition).toEqual(new Date('2024-01-02'));
      expect(service.lastChangedDefinitionUser).toBe('User 2');
      expect(service.lastChangedScheme).toEqual(new Date('2024-01-03'));
      expect(service.lastChangedSchemeUser).toBe('User 3');
    });

    it('should turn the dates the server sends as strings into dates', () => {
      const fromServer: UnitPropertiesDto = JSON.parse(
        '{ "id": 1, "lastChangedMetadata": "2024-01-01T00:00:00.000Z" }'
      );
      unitStores.metadataLoaded$.next(fromServer);

      expect(service.lastChangedMetadata).toEqual(new Date('2024-01-01'));
    });

    it('should forget the previous unit\'s timestamps when the server sends none', () => {
      service.lastChangedMetadata = new Date();
      service.lastChangedMetadataUser = 'Someone';
      service.lastChangedDefinition = new Date();
      service.lastChangedScheme = new Date();

      unitStores.metadataLoaded$.next({ id: 1 });

      expect(service.lastChangedMetadata).toBeUndefined();
      expect(service.lastChangedMetadataUser).toBeUndefined();
      expect(service.lastChangedDefinition).toBeUndefined();
      expect(service.lastChangedDefinitionUser).toBeUndefined();
      expect(service.lastChangedScheme).toBeUndefined();
      expect(service.lastChangedSchemeUser).toBeUndefined();
    });
  });

  describe('saveUnitData', () => {
    beforeEach(() => {
      service.selectedWorkspaceId = 1;
      service.selectedUnit$.next(1);
      appService.authData = {
        ...mockAuthData,
        userLongName: 'Test User'
      };
    });

    it('should save only changed metadata', async () => {
      const metadataStore = new UnitMetadataStore({ id: 1, key: 'test', name: 'Test' });
      metadataStore.setPlayer('newPlayer');
      unitStores.metadataStore.set(metadataStore);

      backendService.setUnitProperties.mockReturnValue(of(true));
      backendService.getUnitList.mockReturnValue(of([]));

      const result = await service.saveUnitData();

      expect(result).toBe(true);
      expect(backendService.setUnitProperties).toHaveBeenCalled();
      expect(appService.dataLoading).toBe(false);
    });

    it('should save only changed definition', async () => {
      const definitionStore = new UnitDefinitionStore(1, { definition: 'old', variables: [] });
      definitionStore.setData([], 'new');
      unitStores.definitionStore.set(definitionStore);

      backendService.setUnitDefinition.mockReturnValue(of(true));

      const result = await service.saveUnitData();

      expect(result).toBe(true);
      expect(backendService.setUnitDefinition).toHaveBeenCalled();
    });

    it('should save only changed scheme', async () => {
      const schemeStore = new UnitSchemeStore(1, { scheme: 'old', schemeType: 'type' });
      schemeStore.setData('new', 'newType');
      unitStores.schemeStore.set(schemeStore);

      backendService.setUnitScheme.mockReturnValue(of(true));

      const result = await service.saveUnitData();

      expect(result).toBe(true);
      expect(backendService.setUnitScheme).toHaveBeenCalled();
    });

    it('should save all changed stores in order', async () => {
      const metadataStore = new UnitMetadataStore({ id: 1, key: 'test', name: 'Test' });
      metadataStore.setPlayer('newPlayer');
      const definitionStore = new UnitDefinitionStore(1, { definition: 'old', variables: [] });
      definitionStore.setData([], 'new');
      const schemeStore = new UnitSchemeStore(1, { scheme: 'old', schemeType: 'type' });
      schemeStore.setData('new', 'newType');

      unitStores.metadataStore.set(metadataStore);
      unitStores.definitionStore.set(definitionStore);
      unitStores.schemeStore.set(schemeStore);

      backendService.setUnitProperties.mockReturnValue(of(true));
      backendService.setUnitDefinition.mockReturnValue(of(true));
      backendService.setUnitScheme.mockReturnValue(of(true));
      backendService.getUnitList.mockReturnValue(of([]));

      const result = await service.saveUnitData();

      expect(result).toBe(true);
      expect(backendService.setUnitProperties).toHaveBeenCalled();
      expect(backendService.setUnitDefinition).toHaveBeenCalled();
      expect(backendService.setUnitScheme).toHaveBeenCalled();
    });

    it('should stop saving on first error', async () => {
      const metadataStore = new UnitMetadataStore({ id: 1, key: 'test', name: 'Test' });
      metadataStore.setPlayer('newPlayer');
      const definitionStore = new UnitDefinitionStore(1, { definition: 'old', variables: [] });
      definitionStore.setData([], 'new');

      unitStores.metadataStore.set(metadataStore);
      unitStores.definitionStore.set(definitionStore);

      backendService.setUnitProperties.mockReturnValue(of(false));

      const result = await service.saveUnitData();

      expect(result).toBe(false);
      expect(backendService.setUnitProperties).toHaveBeenCalled();
      expect(backendService.setUnitDefinition).not.toHaveBeenCalled();
    });

    it('should reload unit list when key/name/group/state changed', async () => {
      const metadataStore = new UnitMetadataStore({ id: 1, key: 'old', name: 'Old' });
      metadataStore.setBasicData('new', 'New', '', '', '', '', '');
      unitStores.metadataStore.set(metadataStore);

      backendService.setUnitProperties.mockReturnValue(of(true));
      backendService.getUnitList.mockReturnValue(of([
        { id: 1, key: 'new', name: 'New' }
      ]));

      const result = await service.saveUnitData();

      expect(result).toBe(true);
      expect(backendService.getUnitList).toHaveBeenCalled();
    });

    it('should set dataLoading flag during save', async () => {
      const metadataStore = new UnitMetadataStore({ id: 1, key: 'test', name: 'Test' });
      metadataStore.setPlayer('newPlayer');
      unitStores.metadataStore.set(metadataStore);

      backendService.setUnitProperties.mockReturnValue(of(true));
      backendService.getUnitList.mockReturnValue(of([]));

      expect(appService.dataLoading).toBe(false);
      const promise = service.saveUnitData();
      expect(appService.dataLoading).toBe(true);
      await promise;
      expect(appService.dataLoading).toBe(false);
    });

    it('should read the metadata back when the save created items', async () => {
      const metadataStore = new UnitMetadataStore({ id: 1, metadata: { items: [] } });
      metadataStore.setMetadata({ items: [{ id: 'item1' }] });
      unitStores.metadataStore.set(metadataStore);
      const reloadSpy = jest.fn();
      service.unitMetadataReloaded.subscribe(reloadSpy);
      const stored = { items: [{ id: 'item1', uuid: 'uuid-1' }] };

      backendService.setUnitProperties.mockReturnValue(of(true));
      backendService.getUnitProperties.mockReturnValue(of({ id: 1, metadata: stored }));

      const result = await service.saveUnitData();

      expect(result).toBe(true);
      expect(backendService.getUnitProperties).toHaveBeenCalledWith(1, 1);
      expect(metadataStore.getData().metadata).toEqual(stored);
      expect(metadataStore.isChanged()).toBe(false);
      expect(reloadSpy).toHaveBeenCalledTimes(1);
    });

    it('should not read the metadata back when all saved items exist', async () => {
      const metadataStore = new UnitMetadataStore({ id: 1, metadata: { items: [{ id: 'item1', uuid: 'uuid-1' }] } });
      metadataStore.setMetadata({ items: [{ id: 'item2', uuid: 'uuid-1' }] });
      unitStores.metadataStore.set(metadataStore);
      const reloadSpy = jest.fn();
      service.unitMetadataReloaded.subscribe(reloadSpy);

      backendService.setUnitProperties.mockReturnValue(of(true));

      await service.saveUnitData();

      expect(backendService.getUnitProperties).not.toHaveBeenCalled();
      expect(reloadSpy).not.toHaveBeenCalled();
    });

    it('should leave the store alone when the reloaded unit is no longer selected', async () => {
      const metadataStore = new UnitMetadataStore({ id: 1, metadata: { items: [] } });
      metadataStore.setMetadata({ items: [{ id: 'item1' }] });
      unitStores.metadataStore.set(metadataStore);
      const otherStore = new UnitMetadataStore({ id: 2, metadata: { items: [] } });
      const reloadSpy = jest.fn();
      service.unitMetadataReloaded.subscribe(reloadSpy);

      backendService.setUnitProperties.mockReturnValue(of(true));
      backendService.getUnitProperties.mockImplementation(() => {
        unitStores.metadataStore.set(otherStore);
        return of({ id: 1, metadata: { items: [{ id: 'item1', uuid: 'uuid-1' }] } });
      });

      await service.saveUnitData();

      expect(otherStore.getData().metadata).toEqual({ items: [] });
      expect(reloadSpy).not.toHaveBeenCalled();
    });

    it('should save every part under the unit that was open when the save started', async () => {
      const metadataStore = new UnitMetadataStore({ id: 1, key: 'test', name: 'Test' });
      metadataStore.setPlayer('newPlayer');
      const definitionStore = new UnitDefinitionStore(1, { definition: 'old', variables: [] });
      definitionStore.setData([], 'new');
      unitStores.metadataStore.set(metadataStore);
      unitStores.definitionStore.set(definitionStore);

      backendService.setUnitProperties.mockImplementation(() => {
        // another unit is opened while the properties are on their way
        service.selectedUnit$.next(2);
        return of(true);
      });
      backendService.setUnitDefinition.mockReturnValue(of(true));

      await service.saveUnitData();

      expect(backendService.setUnitDefinition).toHaveBeenCalledWith(1, 1, { definition: 'new' });
    });

    it('should update lastChanged timestamps after successful save', async () => {
      const metadataStore = new UnitMetadataStore({ id: 1, key: 'test', name: 'Test' });
      metadataStore.setPlayer('newPlayer');
      unitStores.metadataStore.set(metadataStore);

      backendService.setUnitProperties.mockReturnValue(of(true));
      backendService.getUnitList.mockReturnValue(of([]));

      const beforeSave = new Date();
      await service.saveUnitData();
      const afterSave = new Date();

      expect(service.lastChangedMetadata).toBeDefined();
      expect(service.lastChangedMetadata!.getTime()).toBeGreaterThanOrEqual(beforeSave.getTime());
      expect(service.lastChangedMetadata!.getTime()).toBeLessThanOrEqual(afterSave.getTime());
      expect(service.lastChangedMetadataUser).toBe('Test User');
    });

    it('should apply changes to stores after successful save', async () => {
      const metadataStore = new UnitMetadataStore({ id: 1, key: 'test', name: 'Test' });
      metadataStore.setPlayer('newPlayer');
      unitStores.metadataStore.set(metadataStore);

      const applyChangesSpy = jest.spyOn(metadataStore, 'applyChanges');

      backendService.setUnitProperties.mockReturnValue(of(true));
      backendService.getUnitList.mockReturnValue(of([]));

      await service.saveUnitData();

      expect(applyChangesSpy).toHaveBeenCalled();
    });

    it('should use userName when userLongName is not available', async () => {
      appService.authData = {
        ...mockAuthData,
        userName: 'testuser',
        userLongName: ''
      };

      const metadataStore = new UnitMetadataStore({ id: 1, key: 'test', name: 'Test' });
      metadataStore.setPlayer('newPlayer');
      unitStores.metadataStore.set(metadataStore);

      backendService.setUnitProperties.mockReturnValue(of(true));
      backendService.getUnitList.mockReturnValue(of([]));

      await service.saveUnitData();

      expect(service.lastChangedMetadataUser).toBe('testuser');
    });
  });

  describe('event emitters', () => {
    it('should emit onCommentsUpdated event', () => {
      const emitSpy = jest.fn();
      service.onCommentsUpdated.subscribe(emitSpy);

      service.onCommentsUpdated.emit();

      expect(emitSpy).toHaveBeenCalled();
    });
  });

  describe('unitKeyTaken', () => {
    it('should start free and follow what the properties report', () => {
      expect(service.unitKeyTaken()).toBe(false);

      service.setUnitKeyTaken(true);

      expect(service.unitKeyTaken()).toBe(true);
    });
  });

  describe('loadRichNoteTags', () => {
    it('should call RichNoteTagsService.loadTags', () => {
      service.loadRichNoteTags();
      expect(richNoteTagsService.loadTags).toHaveBeenCalled();
    });
  });

  describe('getRichNoteTagLabel', () => {
    it('should call RichNoteTagsService.getTagLabel', () => {
      const mockLabel = [{ lang: 'de', value: 'Label' }];
      richNoteTagsService.getTagLabel.mockReturnValue(mockLabel);

      const result = service.getRichNoteTagLabel('tag1');
      expect(richNoteTagsService.getTagLabel).toHaveBeenCalledWith('tag1');
      expect(result).toEqual(mockLabel);
    });
  });
});
