// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { Component, Input } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { createMock } from '@golevelup/ts-jest';
import { WorkspaceSettingsDto } from '@studio-lite-lib/api-dto';
import { UnitMetadataValues as IqbUnitMetadataValues } from '@iqb/metadata-components';
import { UnitMetadataStore } from '../../classes/unit-metadata-store';
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
      unitDefinitionStoreChanged: new Subject<void>(),
      workspaceSettings: {
        defaultEditor: '',
        defaultPlayer: '',
        defaultSchemer: '',
        unitGroups: [],
        states: [],
        stableModulesOnly: true
      } as WorkspaceSettingsDto,
      loadUnitProperties: () => of(null),
      getUnitDefinitionStore: () => undefined,
      getUnitSchemeStore: () => undefined,
      getUnitMetadataStore: () => undefined,
      setUnitSchemeStore: () => {},
      isValidFormKey: new BehaviorSubject<boolean>(true)
    } as unknown as WorkspaceService;

    const moduleServiceStub = {
      editors: {},
      players: {},
      schemers: {},
      loadList: jest.fn().mockResolvedValue(undefined)
    } as unknown as ModuleService;

    const backendServiceStub = {
      getUnitScheme: jest.fn().mockReturnValue(of(null))
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

  it('should create', () => {
    expect(component).toBeTruthy();
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

  it('should merge profiles in onMetadataChange and call setMetadata', () => {
    const mockStore = createMock<UnitMetadataStore>();
    jest.spyOn(component.workspaceService, 'getUnitMetadataStore')
      .mockReturnValue(mockStore);
    component.metadata = {
      profiles: [{ profileId: 'p1', entries: [] }],
      items: [{ id: 'item1', profiles: [] }]
    };

    component.onMetadataChange(createMock<IqbUnitMetadataValues>({
      profiles: [{ profileId: 'p2', entries: [] }]
    }));

    expect(component.metadata.profiles).toEqual([{ profileId: 'p2', entries: [] }]);
    expect(component.metadata.items).toEqual([{ id: 'item1', profiles: [] }]);
    expect(mockStore.setMetadata).toHaveBeenCalledWith(component.metadata);
  });

  it('should merge items in onItemsMetadataChange and call setMetadata', () => {
    const mockStore = createMock<UnitMetadataStore>();
    jest.spyOn(component.workspaceService, 'getUnitMetadataStore')
      .mockReturnValue(mockStore);
    component.metadata = {
      profiles: [{ profileId: 'p1', entries: [] }],
      items: [{ id: 'item1', profiles: [] }]
    };

    component.onItemsMetadataChange({
      profiles: [],
      items: [{ id: 'item2', profiles: [] }]
    });

    expect(component.metadata.profiles).toEqual([{ profileId: 'p1', entries: [] }]);
    expect(component.metadata.items).toEqual([{ id: 'item2', profiles: [] }]);
    expect(mockStore.setMetadata).toHaveBeenCalledWith(component.metadata);
  });
});
