// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { Component, Input } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { createMock } from '@golevelup/ts-jest';
import {
  UnitMetadataValues, UnitPropertiesDto, WorkspaceSettingsDto
} from '@studio-lite-lib/api-dto';
import { UnitMetadataStore } from '../../classes/unit-metadata-store';
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

  it('updates group name via form control', () => {
    component.unitForm.get('group')?.setValue('');

    component.onGroupNameChange('Group A');

    expect(component.unitForm.get('group')?.value).toBe('Group A');
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
});
