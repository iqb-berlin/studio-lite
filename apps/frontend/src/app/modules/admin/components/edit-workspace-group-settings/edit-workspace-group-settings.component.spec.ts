import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { provideHttpClient } from '@angular/common/http';
import { of, Subject } from 'rxjs';
import { WorkspaceGroupFullDto, WorkspaceGroupSettingsDto } from '@studio-lite-lib/api-dto';
import { EditWorkspaceGroupSettingsComponent } from './edit-workspace-group-settings.component';
import { environment } from '../../../../../environments/environment';
import { EditWorkspaceGroupComponentData } from '../../models/edit-workspace-group-component-data.type';
import { BackendService } from '../../services/backend.service';
import { Profile } from '../../../../models/profile.type';

global.fetch = jest.fn(() => Promise.resolve({
  json: () => Promise.resolve({ test: 100 })
})) as jest.Mock;

describe('EditWorkspaceGroupSettingsComponent', () => {
  let component: EditWorkspaceGroupSettingsComponent;
  let fixture: ComponentFixture<EditWorkspaceGroupSettingsComponent>;
  let backendService: jest.Mocked<BackendService>;

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

    backendService.getWorkspaceGroupById.mockReturnValue(of(mockWorkspaceGroup));

    fixture = TestBed.createComponent(EditWorkspaceGroupSettingsComponent);
    component = fixture.componentInstance;
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

  // Saving before the stored profiles are in would replace them with an empty list (#1960).
  describe('save button', () => {
    const save = (): HTMLButtonElement => fixture.nativeElement
      .querySelector('[data-cy="admin-edit-workspace-group-settings-save-button"]');
    const notLoaded = (): HTMLElement | null => fixture.nativeElement
      .querySelector('[data-cy="admin-edit-workspace-group-settings-not-loaded"]');

    it('should stay disabled until the stored profiles have loaded', () => {
      const group = new Subject<WorkspaceGroupFullDto | boolean>();
      backendService.getWorkspaceGroupById.mockReturnValue(group);
      fixture.detectChanges();

      expect(save().disabled).toBe(true);
      expect(notLoaded()).toBeNull();

      group.next(mockWorkspaceGroup);
      fixture.detectChanges();

      expect(save().disabled).toBe(false);
    });

    it('should stay disabled and say so when the stored profiles could not be loaded', () => {
      backendService.getWorkspaceGroupById.mockReturnValue(of(false));
      fixture.detectChanges();

      expect(save().disabled).toBe(true);
      expect(notLoaded()).not.toBeNull();
    });
  });

  it('should update formData when hasChanged is called', () => {
    const newProfiles: Profile[] = [
      { id: 'profile3', label: 'Profile 3' }
    ];

    component.hasChanged(newProfiles);

    expect(component.formData.profilesSelected).toEqual(newProfiles);
  });
});
