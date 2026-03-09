// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { Component, Input } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { WorkspaceSettingsDto } from '@studio-lite-lib/api-dto';
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
import { SelectModuleComponent } from '../../../shared/components/select-module/select-module.component';

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
});
