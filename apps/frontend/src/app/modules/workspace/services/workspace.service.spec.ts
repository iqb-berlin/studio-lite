import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
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
import { UnitMetadataStore } from '../classes/unit-metadata-store';
import { UnitDefinitionStore } from '../classes/unit-definition-store';
import { UnitSchemeStore } from '../classes/unit-scheme-store';

describe('WorkspaceService', () => {
  let service: WorkspaceService;
  let backendService: jest.Mocked<WorkspaceBackendService>;
  let appService: jest.Mocked<AppService>;

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

    TestBed.configureTestingModule({
      providers: [
        WorkspaceService,
        { provide: WorkspaceBackendService, useValue: backendServiceMock },
        { provide: AppService, useValue: appServiceMock }
      ]
    });

    service = TestBed.inject(WorkspaceService);
    backendService = TestBed.inject(WorkspaceBackendService) as jest.Mocked<WorkspaceBackendService>;
    appService = TestBed.inject(AppService) as jest.Mocked<AppService>;
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
      const validator = WorkspaceService.unitKeyUniquenessValidator(0, unitList);
      const control = { value: 'NEWUNIT' } as AbstractControl;
      const result = validator(control);
      expect(result).toBeNull();
    });

    it('should return error for duplicate key (case insensitive)', () => {
      const validator = WorkspaceService.unitKeyUniquenessValidator(0, unitList);
      const control = { value: 'unit1' } as AbstractControl;
      const result = validator(control);
      expect(result).toEqual({
        keyNotUnique: 'Der Kurzname muss eindeutig innerhalb des Arbeitsbereiches sein.'
      });
    });

    it('should allow same key for same unit', () => {
      const validator = WorkspaceService.unitKeyUniquenessValidator(1, unitList);
      const control = { value: 'UNIT1' } as AbstractControl;
      const result = validator(control);
      expect(result).toBeNull();
    });

    it('should trim whitespace when checking uniqueness', () => {
      const validator = WorkspaceService.unitKeyUniquenessValidator(0, unitList);
      const control = { value: '  UNIT2  ' } as AbstractControl;
      const result = validator(control);
      expect(result).not.toBeNull();
    });
  });

  describe('resetUnitData', () => {
    it('should reset all unit data and timestamps', () => {
      service.lastChangedMetadata = new Date();
      service.lastChangedScheme = new Date();
      service.lastChangedDefinition = new Date();
      service.setUnitMetadataStore(new UnitMetadataStore({ id: 1 }));
      service.setUnitDefinitionStore(new UnitDefinitionStore(1, { definition: '', variables: [] }));
      service.setUnitSchemeStore(new UnitSchemeStore(1, { scheme: '', schemeType: '' }));

      service.resetUnitData();

      expect(service.lastChangedMetadata).toBeUndefined();
      expect(service.lastChangedScheme).toBeUndefined();
      expect(service.lastChangedDefinition).toBeUndefined();
      expect(service.getUnitMetadataStore()).toBeUndefined();
      expect(service.getUnitDefinitionStore()).toBeUndefined();
      expect(service.getUnitSchemeStore()).toBeUndefined();
    });
  });

  describe('setUnitDefinitionStore', () => {
    it('should set unit definition store and emit event', () => {
      const emitSpy = jest.fn();
      service.unitDefinitionStoreChanged.subscribe(emitSpy);

      const store = new UnitDefinitionStore(1, { definition: 'test', variables: [] });
      service.setUnitDefinitionStore(store);

      expect(service.getUnitDefinitionStore()).toBe(store);
      expect(emitSpy).toHaveBeenCalledWith(store);
    });

    it('should set undefined and emit event', () => {
      const emitSpy = jest.fn();
      service.unitDefinitionStoreChanged.subscribe(emitSpy);

      service.setUnitDefinitionStore(undefined);

      expect(service.getUnitDefinitionStore()).toBeUndefined();
      expect(emitSpy).toHaveBeenCalledWith(undefined);
    });
  });

  describe('setUnitSchemeStore', () => {
    it('should set unit scheme store and emit event', () => {
      const emitSpy = jest.fn();
      service.unitSchemeStoreChanged.subscribe(emitSpy);

      const store = new UnitSchemeStore(1, { scheme: 'test', schemeType: 'type' });
      service.setUnitSchemeStore(store);

      expect(service.getUnitSchemeStore()).toBe(store);
      expect(emitSpy).toHaveBeenCalledWith(store);
    });
  });

  describe('setUnitMetadataStore', () => {
    it('should set unit metadata store and emit event', () => {
      const emitSpy = jest.fn();
      service.unitMetadataStoreChanged.subscribe(emitSpy);

      const store = new UnitMetadataStore({ id: 1, key: 'test', name: 'Test' });
      service.setUnitMetadataStore(store);

      expect(service.getUnitMetadataStore()).toBe(store);
      expect(emitSpy).toHaveBeenCalledWith(store);
    });
  });

  describe('restoreUnitStores', () => {
    it('should restore all stores that are set', () => {
      const metadataStore = new UnitMetadataStore({ id: 1, key: 'test', name: 'Test' });
      const definitionStore = new UnitDefinitionStore(1, { definition: 'def', variables: [] });
      const schemeStore = new UnitSchemeStore(1, { scheme: 'scheme', schemeType: 'type' });

      const metadataRestoreSpy = jest.spyOn(metadataStore, 'restore');
      const definitionRestoreSpy = jest.spyOn(definitionStore, 'restore');
      const schemeRestoreSpy = jest.spyOn(schemeStore, 'restore');

      service.setUnitMetadataStore(metadataStore);
      service.setUnitDefinitionStore(definitionStore);
      service.setUnitSchemeStore(schemeStore);

      service.restoreUnitStores();

      expect(metadataRestoreSpy).toHaveBeenCalled();
      expect(definitionRestoreSpy).toHaveBeenCalled();
      expect(schemeRestoreSpy).toHaveBeenCalled();
    });

    it('should not throw error when stores are undefined', () => {
      service.setUnitMetadataStore(undefined);
      service.setUnitDefinitionStore(undefined);
      service.setUnitSchemeStore(undefined);

      expect(() => service.restoreUnitStores()).not.toThrow();
    });
  });

  describe('isChanged', () => {
    it('should return false when no stores are set', () => {
      service.setUnitMetadataStore(undefined);
      service.setUnitDefinitionStore(undefined);
      service.setUnitSchemeStore(undefined);

      expect(service.isChanged()).toBe(false);
    });

    it('should return true when metadata store has changes', () => {
      const metadataStore = new UnitMetadataStore({ id: 1, key: 'test', name: 'Test' });
      metadataStore.setPlayer('newPlayer');
      service.setUnitMetadataStore(metadataStore);

      expect(service.isChanged()).toBe(true);
    });

    it('should return true when definition store has changes', () => {
      const definitionStore = new UnitDefinitionStore(1, { definition: 'old', variables: [] });
      definitionStore.setData([], 'new');
      service.setUnitDefinitionStore(definitionStore);

      expect(service.isChanged()).toBe(true);
    });

    it('should return true when scheme store has changes', () => {
      const schemeStore = new UnitSchemeStore(1, { scheme: 'old', schemeType: 'type' });
      schemeStore.setData('new', 'newType');
      service.setUnitSchemeStore(schemeStore);

      expect(service.isChanged()).toBe(true);
    });

    it('should return false when stores exist but have no changes', () => {
      service.setUnitMetadataStore(new UnitMetadataStore({ id: 1 }));
      service.setUnitDefinitionStore(new UnitDefinitionStore(1, { definition: '', variables: [] }));
      service.setUnitSchemeStore(new UnitSchemeStore(1, { scheme: '', schemeType: '' }));

      expect(service.isChanged()).toBe(false);
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
    it('should fetch and set workspace group states', () => {
      const mockStates = [
        {
          id: 1, label: 'Draft', value: 'draft', color: '#cccccc'
        },
        {
          id: 2, label: 'Final', value: 'final', color: '#00ff00'
        }
      ];
      const mockResponse: WorkspaceGroupFullDto = {
        id: 1,
        name: 'Test Group',
        settings: {
          states: mockStates,
          defaultEditor: '',
          defaultPlayer: '',
          defaultSchemer: ''
        }
      };

      service.groupId = 1;
      backendService.getWorkspaceGroupStates.mockReturnValue(of(mockResponse));

      service.setWorkspaceGroupStates();

      expect(backendService.getWorkspaceGroupStates).toHaveBeenCalledWith(1);
      expect(service.workspaceSettings.states).toEqual(mockStates);
      expect(service.states).toEqual(mockStates);
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
    it('should return existing metadata store if already loaded', done => {
      const existingStore = new UnitMetadataStore({ id: 1, key: 'test', name: 'Test' });
      service.setUnitMetadataStore(existingStore);

      service.loadUnitProperties().subscribe(store => {
        expect(store).toBe(existingStore);
        expect(backendService.getUnitProperties).not.toHaveBeenCalled();
        done();
      });
    });

    it('should fetch unit properties and create metadata store', done => {
      const mockProperties: UnitPropertiesDto = {
        id: 1,
        key: 'unit1',
        name: 'Unit 1',
        lastChangedMetadata: new Date('2024-01-01'),
        lastChangedMetadataUser: 'User 1',
        lastChangedDefinition: new Date('2024-01-02'),
        lastChangedDefinitionUser: 'User 2',
        lastChangedScheme: new Date('2024-01-03'),
        lastChangedSchemeUser: 'User 3'
      };

      service.selectedWorkspaceId = 1;
      service.selectedUnit$.next(1);
      service.setUnitMetadataStore(undefined);
      backendService.getUnitProperties.mockReturnValue(of(mockProperties));

      service.loadUnitProperties().subscribe(store => {
        expect(store).toBeDefined();
        expect(service.lastChangedMetadata).toEqual(new Date('2024-01-01'));
        expect(service.lastChangedMetadataUser).toBe('User 1');
        expect(service.lastChangedDefinition).toEqual(new Date('2024-01-02'));
        expect(service.lastChangedDefinitionUser).toBe('User 2');
        expect(service.lastChangedScheme).toEqual(new Date('2024-01-03'));
        expect(service.lastChangedSchemeUser).toBe('User 3');
        done();
      });
    });

    it('should create empty metadata store when no properties are returned', done => {
      service.selectedWorkspaceId = 1;
      service.selectedUnit$.next(5);
      service.setUnitMetadataStore(undefined);
      backendService.getUnitProperties.mockReturnValue(of(null));

      service.loadUnitProperties().subscribe(store => {
        expect(store).toBeDefined();
        expect(store?.getChangedData().id).toBe(5);
        done();
      });
    });

    it('should reset timestamps before loading', done => {
      service.lastChangedMetadata = new Date();
      service.lastChangedDefinition = new Date();
      service.lastChangedScheme = new Date();

      service.selectedWorkspaceId = 1;
      service.selectedUnit$.next(1);
      service.setUnitMetadataStore(undefined);
      backendService.getUnitProperties.mockReturnValue(of(null));

      service.loadUnitProperties().subscribe(() => {
        expect(service.lastChangedMetadataUser).toBeUndefined();
        expect(service.lastChangedDefinitionUser).toBeUndefined();
        expect(service.lastChangedSchemeUser).toBeUndefined();
        done();
      });
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
      service.setUnitMetadataStore(metadataStore);

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
      service.setUnitDefinitionStore(definitionStore);

      backendService.setUnitDefinition.mockReturnValue(of(true));

      const result = await service.saveUnitData();

      expect(result).toBe(true);
      expect(backendService.setUnitDefinition).toHaveBeenCalled();
    });

    it('should save only changed scheme', async () => {
      const schemeStore = new UnitSchemeStore(1, { scheme: 'old', schemeType: 'type' });
      schemeStore.setData('new', 'newType');
      service.setUnitSchemeStore(schemeStore);

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

      service.setUnitMetadataStore(metadataStore);
      service.setUnitDefinitionStore(definitionStore);
      service.setUnitSchemeStore(schemeStore);

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

      service.setUnitMetadataStore(metadataStore);
      service.setUnitDefinitionStore(definitionStore);

      backendService.setUnitProperties.mockReturnValue(of(false));

      const result = await service.saveUnitData();

      expect(result).toBe(false);
      expect(backendService.setUnitProperties).toHaveBeenCalled();
      expect(backendService.setUnitDefinition).not.toHaveBeenCalled();
    });

    it('should reload unit list when key/name/group/state changed', async () => {
      const metadataStore = new UnitMetadataStore({ id: 1, key: 'old', name: 'Old' });
      metadataStore.setBasicData('new', 'New', '', '', '', '', '');
      service.setUnitMetadataStore(metadataStore);

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
      service.setUnitMetadataStore(metadataStore);

      backendService.setUnitProperties.mockReturnValue(of(true));
      backendService.getUnitList.mockReturnValue(of([]));

      expect(appService.dataLoading).toBe(false);
      const promise = service.saveUnitData();
      expect(appService.dataLoading).toBe(true);
      await promise;
      expect(appService.dataLoading).toBe(false);
    });

    it('should update lastChanged timestamps after successful save', async () => {
      const metadataStore = new UnitMetadataStore({ id: 1, key: 'test', name: 'Test' });
      metadataStore.setPlayer('newPlayer');
      service.setUnitMetadataStore(metadataStore);

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
      service.setUnitMetadataStore(metadataStore);

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
      service.setUnitMetadataStore(metadataStore);

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

    it('should emit unitPropertiesChange event', () => {
      const emitSpy = jest.fn();
      service.unitPropertiesChange.subscribe(emitSpy);

      service.unitPropertiesChange.emit(true);

      expect(emitSpy).toHaveBeenCalledWith(true);
    });
  });

  describe('loadRichNoteTags', () => {
    it('should load rich note tags from backend', () => {
      const mockTags = [{ id: 'tag1', label: [] }];
      backendService.getUnitRichNoteTags.mockReturnValue(of(mockTags));

      service.loadRichNoteTags();

      expect(backendService.getUnitRichNoteTags).toHaveBeenCalled();
      expect(service.richNoteTags).toEqual(mockTags);
    });
  });

  describe('getRichNoteTagLabel', () => {
    it('should resolve hierarchical tag path', () => {
      service.richNoteTags = [
        {
          id: 'p1',
          label: [{ lang: 'de', value: 'Parent' }],
          children: [
            { id: 'c1', label: [{ lang: 'de', value: 'Child' }] }
          ]
        }
      ];

      const result = service.getRichNoteTagLabel('p1.c1');
      expect(result).toEqual([{ lang: 'de', value: 'Child' }]);
    });

    it('should return empty array if path is invalid', () => {
      service.richNoteTags = [{ id: 'p1', label: [] }];
      const result = service.getRichNoteTagLabel('p1.invalid');
      expect(result).toEqual([]);
    });
  });
});
