import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { WorkspaceGroupFullDto, WorkspaceGroupSettingsDto } from '@studio-lite-lib/api-dto';
import { EditWorkspaceGroupSettingsComponent } from './edit-workspace-group-settings.component';
import { environment } from '../../../../../environments/environment';
import { EditWorkspaceGroupComponentData } from '../../models/edit-workspace-group-component-data.type';
import { BackendService } from '../../services/backend.service';
import { WsgAdminService } from '../../../wsg-admin/services/wsg-admin.service';
import { Profile } from '../../../../models/profile.type';

global.fetch = jest.fn(() => Promise.resolve({
  json: () => Promise.resolve({ test: 100 })
})) as jest.Mock;

describe('EditWorkspaceGroupSettingsComponent', () => {
  let component: EditWorkspaceGroupSettingsComponent;
  let fixture: ComponentFixture<EditWorkspaceGroupSettingsComponent>;
  let backendService: jest.Mocked<BackendService>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let wsgAdminService: jest.Mocked<WsgAdminService>;

  const mockDialogData: EditWorkspaceGroupComponentData = {
    wsg: {
      id: 1,
      name: 'Test Group'
    },
    title: 'Edit Settings',
    saveButtonLabel: 'Save'
  };

  const mockProfiles: Profile[] = [
    { id: 'profile1', label: 'Profile 1' },
    { id: 'profile2', label: 'Profile 2' }
  ];

  const mockSettings: WorkspaceGroupSettingsDto = {
    profiles: mockProfiles,
    defaultEditor: 'test-editor',
    defaultPlayer: 'test-player',
    defaultSchemer: 'test-schemer',
    states: []
  };

  const mockWorkspaceGroup: WorkspaceGroupFullDto = {
    id: 1,
    name: 'Test Group',
    settings: mockSettings
  };

  beforeEach(async () => {
    const backendServiceMock = {
      getWorkspaceGroupById: jest.fn()
    };

    const wsgAdminServiceMock = {
      selectedWorkspaceGroupSettings: mockSettings
    };

    await TestBed.configureTestingModule({
      imports: [
        EditWorkspaceGroupSettingsComponent,
        MatInputModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatSnackBarModule,
        TranslateModule.forRoot()
      ],
      providers: [
        provideHttpClient(),
        { provide: BackendService, useValue: backendServiceMock },
        { provide: WsgAdminService, useValue: wsgAdminServiceMock },
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: mockDialogData
        }
      ]
    })
      .compileComponents();

    backendService = TestBed.inject(BackendService) as jest.Mocked<BackendService>;
    wsgAdminService = TestBed.inject(WsgAdminService) as jest.Mocked<WsgAdminService>;

    backendService.getWorkspaceGroupById.mockReturnValue(of(mockWorkspaceGroup));

    fixture = TestBed.createComponent(EditWorkspaceGroupSettingsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize formData with empty arrays', () => {
    expect(component.formData).toBeDefined();
    expect(component.formData.profilesSelected).toEqual([]);
    expect(component.formData.states).toEqual([]);
  });

  it('should have empty profiles array initially', () => {
    expect(component.profiles).toEqual([]);
  });

  it('should have empty fetchedProfiles array initially', () => {
    expect(component.fetchedProfiles).toEqual([]);
  });

  it('should load settings on init', async () => {
    await component.ngOnInit();

    expect(component.settings).toBe(mockSettings);
    expect(backendService.getWorkspaceGroupById).toHaveBeenCalledWith(1);
  });

  it('should load profiles from workspace group on init', async () => {
    await component.ngOnInit();

    expect(component.fetchedProfiles).toEqual(mockProfiles);
    expect(component.formData.profilesSelected).toEqual(mockProfiles);
  });

  it('should handle workspace group without settings', async () => {
    const workspaceGroupWithoutSettings: WorkspaceGroupFullDto = {
      id: 1,
      name: 'Test Group',
      settings: undefined
    };

    backendService.getWorkspaceGroupById.mockReturnValue(of(workspaceGroupWithoutSettings));

    await component.ngOnInit();

    expect(component.fetchedProfiles).toEqual([]);
    expect(component.formData.profilesSelected).toEqual([]);
  });

  it('should handle null response from backend', async () => {
    backendService.getWorkspaceGroupById.mockReturnValue(of(false));

    await component.ngOnInit();

    expect(component.fetchedProfiles).toEqual([]);
    expect(component.formData.profilesSelected).toEqual([]);
  });

  it('should update formData when hasChanged is called', () => {
    const newProfiles: Profile[] = [
      { id: 'profile3', label: 'Profile 3' }
    ];

    component.hasChanged(newProfiles);

    expect(component.formData.profilesSelected).toEqual(newProfiles);
  });

  it('should have data property with wsg information', () => {
    expect(component.data).toBeDefined();
    expect(component.data.wsg?.id).toBe(1);
    expect(component.data.wsg?.name).toBe('Test Group');
  });

  it('should access wsgAdminService', () => {
    expect(component.wsgAdminService).toBeDefined();
  });

  it('should access backendService', () => {
    expect(component.backendService).toBeDefined();
  });

  it('should handle workspace group with empty profiles array', async () => {
    const workspaceGroupEmptyProfiles: WorkspaceGroupFullDto = {
      id: 1,
      name: 'Test Group',
      settings: {
        ...mockSettings,
        profiles: []
      }
    };

    backendService.getWorkspaceGroupById.mockReturnValue(of(workspaceGroupEmptyProfiles));

    await component.ngOnInit();

    expect(component.fetchedProfiles).toEqual([]);
  });
});
