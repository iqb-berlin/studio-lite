// eslint-disable-next-line max-classes-per-file
import {
  ComponentFixture, fakeAsync, flush, TestBed
} from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { createMock } from '@golevelup/ts-jest';
import { MDProfile } from '@iqbspecs/metadata-profile';
import {
  MetadataProfileDto, UnitMetadataValues, UnitPropertiesDto, WorkspaceSettingsDto
} from '@studio-lite-lib/api-dto';
import { UnitMetadataStore } from '../../classes/unit-metadata-store';
import { UnitSchemeStore } from '../../classes/unit-scheme-store';
import { AliasId } from '../../../metadata/models/alias-id.interface';
import { ModuleService } from '../../../../services/module.service';
import { WorkspaceBackendService } from '../../services/workspace-backend.service';
import { WorkspaceService } from '../../services/workspace.service';
import { MetadataBackendService } from '../../../metadata/services/metadata-backend.service';
import { MetadataService } from '../../../metadata/services/metadata.service';
import { I18nService } from '../../../../services/i18n.service';
import { VeronaModuleClass } from '../../../../models/verona-module.class';
import { UnitPropertiesComponent } from './unit-properties.component';
import { environment } from '../../../../../environments/environment';
import { NewGroupButtonComponent } from '../new-group-button/new-group-button.component';
import { SelectModuleComponent } from '../../../../components/select-module/select-module.component';

describe('UnitPropertiesComponent', () => {
  let component: UnitPropertiesComponent;
  let fixture: ComponentFixture<UnitPropertiesComponent>;

  @Component({ selector: 'studio-lite-new-group-button', template: '', standalone: true })
  class MockNewGroupButtonComponent {
    @Input() disabled!: boolean;
  }

  @Component({ selector: 'studio-lite-select-module', template: '', standalone: true })
  class MockSelectModuleComponent {
    @Input() modules!: { [key: string]: VeronaModuleClass };
    @Input() hidden!: boolean;
    @Input() stableOnly!: boolean;
    // what the view reads and hears of the real one once a unit is open
    value = '';
    @Output() selectionChanged = new EventEmitter<string>();
  }

  beforeEach(async () => {
    const workspaceServiceStub = {
      selectedUnit$: new BehaviorSubject<number>(0),
      selectedWorkspaceId: 1,
      dropBoxId: 1,
      unitMetadataReloaded: new Subject<void>(),
      workspaceSettings: {
        defaultEditor: '',
        defaultPlayer: '',
        defaultSchemer: '',
        unitGroups: [],
        states: [],
        stableModulesOnly: true
      } as WorkspaceSettingsDto,
      loadUnitProperties: () => of(null),
      isValidFormKey: new BehaviorSubject<boolean>(true),
      setUnitKeyTaken: jest.fn()
    } as unknown as WorkspaceService;

    const moduleServiceStub = {
      editors: {},
      players: {},
      schemers: {},
      loadList: jest.fn().mockResolvedValue(undefined)
    } as unknown as ModuleService;

    const backendServiceStub = {
      getUnitScheme: jest.fn().mockReturnValue(of(null)),
      getUnitDefinition: jest.fn().mockReturnValue(of({ definition: 'def', variables: [] }))
    } as unknown as WorkspaceBackendService;

    const metadataBackendServiceStub = {
      getMetadataProfile: jest.fn().mockReturnValue(of({}))
    } as unknown as MetadataBackendService;

    const metadataServiceStub = {
      loadProfileVocabularies: jest.fn().mockResolvedValue(undefined)
    } as unknown as MetadataService;

    await TestBed.configureTestingModule({
      imports: [
        UnitPropertiesComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: WorkspaceService, useValue: workspaceServiceStub },
        { provide: ModuleService, useValue: moduleServiceStub },
        { provide: WorkspaceBackendService, useValue: backendServiceStub },
        { provide: MetadataBackendService, useValue: metadataBackendServiceStub },
        { provide: MetadataService, useValue: metadataServiceStub },
        { provide: I18nService, useValue: {} },
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        }
      ]
    })
      .overrideComponent(UnitPropertiesComponent, {
        remove: { imports: [NewGroupButtonComponent, SelectModuleComponent] },
        add: { imports: [MockNewGroupButtonComponent, MockSelectModuleComponent] }
      })
      .compileComponents();

    fixture = TestBed.createComponent(UnitPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('clears deprecated properties when requested', () => {
    component.unitForm.get('transcript')?.setValue('old');
    component.unitForm.get('reference')?.setValue('old');

    component.deleteDeprecatedProperty('transcript');
    component.deleteDeprecatedProperty('reference');

    expect(component.unitForm.get('transcript')?.value).toBe('');
    expect(component.unitForm.get('reference')?.value).toBe('');
  });

  it('merges changed profiles into the store while preserving items', () => {
    const store = createMock<UnitMetadataStore>();
    store.getData.mockReturnValue({
      metadata: { profiles: [{ profileId: 'old' }], items: [{ id: 'item1' }] }
    } as unknown as UnitPropertiesDto);
    jest.spyOn(component.unitStores, 'metadataStore').mockReturnValue(store);

    component.onMetadataChange({ profiles: [{ profileId: 'new' }] } as unknown as Parameters<
    typeof component.onMetadataChange>[0]);

    expect(store.setMetadata).toHaveBeenCalledWith({
      profiles: [{ profileId: 'new' }],
      items: [{ id: 'item1' }]
    });
  });

  it('merges changed items into the store while preserving profiles', () => {
    const store = createMock<UnitMetadataStore>();
    store.getData.mockReturnValue({
      metadata: { profiles: [{ profileId: 'p1' }], items: [{ id: 'old' }] }
    } as unknown as UnitPropertiesDto);
    jest.spyOn(component.unitStores, 'metadataStore').mockReturnValue(store);

    component.onItemsMetadataChange({ profiles: [], items: [{ id: 'new' }] } as unknown as UnitMetadataValues);

    expect(store.setMetadata).toHaveBeenCalledWith({
      profiles: [{ profileId: 'p1' }],
      items: [{ id: 'new' }]
    });
  });

  it('hands the metadata read back after a save to the form', () => {
    const stored = { items: [{ id: 'item1', uuid: 'uuid-1' }] };
    const store = createMock<UnitMetadataStore>();
    store.getData.mockReturnValue({ id: 1, metadata: stored } as UnitPropertiesDto);
    jest.spyOn(component.unitStores, 'metadataStore').mockReturnValue(store);
    jest.spyOn(component.workspaceService.selectedUnit$, 'getValue').mockReturnValue(1);

    (component.workspaceService.unitMetadataReloaded as unknown as Subject<void>).next();

    expect(component.metadata).toEqual(stored);
    expect(component.metadata).not.toBe(stored);
  });

  it('does not clobber stored profiles when onMetadataChange carries no profiles slice', () => {
    const store = createMock<UnitMetadataStore>();
    store.getData.mockReturnValue({
      metadata: { profiles: [{ profileId: 'p1' }], items: [{ id: 'item1' }] }
    } as unknown as UnitPropertiesDto);
    jest.spyOn(component.unitStores, 'metadataStore').mockReturnValue(store);

    component.onMetadataChange({} as unknown as Parameters<typeof component.onMetadataChange>[0]);

    expect(store.setMetadata).toHaveBeenCalledWith({
      profiles: [{ profileId: 'p1' }],
      items: [{ id: 'item1' }]
    });
  });

  // the list is worked out by the service (unitVariables), the view only hands it on (#1361)
  it('hands on the variables the service works out', () => {
    const variables: AliasId[] = [{ id: 'text', alias: 'text' }];
    jest.spyOn(component.unitStores, 'variables').mockReturnValue(variables);
    const handedOn = jest.fn();
    component.variablesLoader.subscribe(handedOn);
    component.unitStores.loadDefinitionStore(1, 1).subscribe();
    TestBed.tick();

    component.unitStores.definitionStore()?.setData([], 'changed');

    expect(handedOn).toHaveBeenLastCalledWith(variables);
  });

  // #1842: a taken key blocks saving once it is a change; a unit already carrying one stays editable
  it.each([
    [true, true, true],
    [false, true, false],
    [true, false, false]
  ])('reports the key as taken: changed %s, carried by another unit %s → %s', (changed, carried, taken) => {
    const store = createMock<UnitMetadataStore>();
    store.getChangedData.mockReturnValue(changed ? { id: 1, key: 'FIRST1' } : { id: 1 });
    jest.spyOn(component.unitStores, 'metadataStore').mockReturnValue(store);
    component.unitForm.get('key')?.setErrors(carried ? { keyNotUnique: 'taken' } : null);

    (component as unknown as { reportUnitKeyTaken(): void }).reportUnitKeyTaken();

    expect(component.workspaceService.setUnitKeyTaken).toHaveBeenCalledWith(taken);
  });

  // the editor may load the definition only after this view was built
  it('works out the item variables anew when a definition store loaded later changes', () => {
    const variables = jest.fn();
    component.variablesLoader.subscribe(variables);
    variables.mockClear();
    component.unitStores.loadDefinitionStore(1, 1).subscribe();
    TestBed.tick();

    component.unitStores.definitionStore()?.setData([], 'changed');

    expect(variables).toHaveBeenCalledTimes(1);
  });

  describe('with a unit open', () => {
    const unitData = (data: Partial<UnitPropertiesDto> = {}): UnitPropertiesDto => ({
      id: 5,
      key: 'KEY1',
      name: 'Name',
      description: 'Text',
      groupName: 'G1',
      state: '2',
      transcript: 'Transcript',
      reference: 'Reference',
      metadata: {},
      ...data
    });

    // opens the unit as the workspace does: select it, then read its properties from its store
    const openUnit = (data: UnitPropertiesDto): UnitMetadataStore => {
      const store = new UnitMetadataStore(data);
      jest.spyOn(component.unitStores, 'metadataStore').mockReturnValue(store);
      component.workspaceService.selectedUnit$.next(data.id);
      flush();
      return store;
    };

    beforeEach(() => {
      // with the module list there, the properties are read without waiting for it
      component.moduleService.editors = { 'editor@1.0': createMock<VeronaModuleClass>() };
      component.workspaceService.unitList = {};
      component.workspaceService.states = [{ id: 2, label: 'Done', color: 'red' }];
    });

    it('lets the properties be edited and hands each changed field to the unit\'s store', fakeAsync(() => {
      const store = openUnit(unitData());

      component.unitForm.patchValue({
        key: 'KEY2',
        name: 'New name',
        description: 'New text',
        group: 'G2',
        transcript: 'New transcript',
        reference: 'New reference',
        state: '3'
      });

      expect(component.unitForm.enabled).toBe(true);
      expect(store.getChangedData()).toEqual({
        id: 5,
        key: 'KEY2',
        name: 'New name',
        description: 'New text',
        groupName: 'G2',
        transcript: 'New transcript',
        reference: 'New reference',
        state: '3'
      });
    }));

    // A key stored before the rules applied shows its error at once, not only once it is touched.
    // The view is opened with a unit, so the form is enabled when the key of the next one is checked.
    it('shows the error of a loaded key that breaks the rules at once', fakeAsync(() => {
      openUnit(unitData({ key: 'KEY1' }));
      openUnit(unitData({ id: 6, key: 'ab' }));
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('mat-error')).not.toBeNull();
    }));

    it.each([
      ['2', 'red'],
      ['9', '']
    ])('marks the unit in state %s with the colour of that state: \'%s\'', fakeAsync((
      state: string, colour: string
    ) => {
      openUnit(unitData({ state }));

      expect(component.selectedStateColor).toBe(colour);
    }));

    it('takes the colour of the state chosen', fakeAsync(() => {
      openUnit(unitData({ state: '9' }));

      component.unitForm.patchValue({ state: '2' });
      const chosen = component.selectedStateColor;
      component.unitForm.patchValue({ state: '9' });

      expect([chosen, component.selectedStateColor]).toEqual(['red', '']);
    }));

    type ProfileSetting = 'unitMDProfile' | 'itemMDProfile';
    type OfferedProfile = 'unitProfile' | 'itemProfile';
    it.each<[ProfileSetting, OfferedProfile]>([
      ['unitMDProfile', 'unitProfile'],
      ['itemMDProfile', 'itemProfile']
    ])('fetches the %s of the workspace once, and offers it once its vocabularies are there', fakeAsync((
      setting: ProfileSetting, offered: OfferedProfile
    ) => {
      // not a mock: of() would take a mock, which has every method, for a scheduler
      const profile: MetadataProfileDto = {
        id: 'profile', label: [], groups: [], modifiedAt: new Date()
      };
      const getProfile = jest.mocked(TestBed.inject(MetadataBackendService).getMetadataProfile)
        .mockReturnValue(of(profile));
      let vocabulariesLoaded: (loaded: boolean) => void = () => {};
      jest.mocked(TestBed.inject(MetadataService).loadProfileVocabularies)
        .mockReturnValue(new Promise<boolean>(resolve => { vocabulariesLoaded = resolve; }));
      component.workspaceService.workspaceSettings[setting] = 'https://profiles/unit.json';

      openUnit(unitData());
      const offeredBefore = component[offered];
      vocabulariesLoaded(true);
      flush();
      openUnit(unitData({ id: 6 }));

      expect(getProfile.mock.calls).toEqual([['https://profiles/unit.json']]);
      expect(offeredBefore).toBeUndefined();
      expect(component[offered]).toBe(profile as unknown as MDProfile);
    }));

    // without the scheme the list is empty, and an item would take that for its variable having gone
    it.each([
      ['there', true],
      ['not there', false]
    ])('hands the variables to the items only once the scheme is there: %s', fakeAsync((
      _: string, withScheme: boolean
    ) => {
      const variables: AliasId[] = [{ id: 'text', alias: 'text' }];
      jest.spyOn(component.unitStores, 'variables').mockReturnValue(variables);
      jest.spyOn(component.unitStores, 'loadSchemeStore')
        .mockReturnValue(of(withScheme ? new UnitSchemeStore(5, { scheme: '', schemeType: '' }) : undefined));

      openUnit(unitData());

      expect(component.variablesLoaded).toBe(withScheme);
      expect(component.variablesLoader.getValue()).toEqual(withScheme ? variables : []);
    }));

    // Leaving the unit first lets the guard ask about unsaved changes; staying, nothing is sent.
    // Esc, a click beside the dialog and navigation close it with undefined (#1844).
    // Not fakeAsync: the view awaits the routing natively, which fakeAsync cannot flush. The view
    // awaits the same promise as the test, and first, so it has gone on once the test goes on.
    type UnitAction = 'submitUnit' | 'returnSubmittedUnit';
    const sentBy: Record<UnitAction, ['submitUnits' | 'returnSubmittedUnits', unknown[]]> = {
      submitUnit: ['submitUnits', [1, 1, [5]]],
      returnSubmittedUnit: ['returnSubmittedUnits', [1, [5]]]
    };
    it.each<[UnitAction, boolean | undefined, boolean, boolean]>([
      ['submitUnit', true, true, true],
      ['submitUnit', true, false, false],
      ['submitUnit', undefined, true, false],
      ['returnSubmittedUnit', true, true, true],
      ['returnSubmittedUnit', true, false, false],
      ['returnSubmittedUnit', undefined, true, false]
    ])('%s: confirmed %s, unit left %s → sent %s', async (action, confirmed, left, sent) => {
      component.workspaceService.selectedUnit$.next(5);
      jest.spyOn(TestBed.inject(MatDialog), 'open')
        .mockReturnValue(createMock<MatDialogRef<unknown>>({ afterClosed: () => of(confirmed) }));
      const leaving = Promise.resolve(left);
      const selectUnit = jest.spyOn(component, 'selectUnit').mockReturnValue(leaving);
      jest.spyOn(component.snackBar, 'open').mockImplementation();
      const [method, args] = sentBy[action];
      const send = jest.fn().mockReturnValue(of(false));
      component.backendService[method] = send;

      component[action]();
      await leaving;

      expect(selectUnit.mock.calls).toEqual(confirmed ? [[0]] : []);
      expect(send.mock.calls).toEqual(sent ? [args] : []);
    });
  });
});
