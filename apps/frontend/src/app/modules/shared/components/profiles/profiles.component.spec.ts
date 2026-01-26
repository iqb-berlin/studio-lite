import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MatCheckboxModule, MatCheckboxChange } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';
import {
  MetadataProfileDto,
  RegisteredMetadataProfileDto,
  WorkspaceGroupSettingsDto
} from '@studio-lite-lib/api-dto';
import { ProfilesComponent } from './profiles.component';
import { WsgAdminService } from '../../../wsg-admin/services/wsg-admin.service';
import { MetadataBackendService } from '../../../metadata/services/metadata-backend.service';

describe('ProfilesComponent', () => {
  let component: ProfilesComponent;
  let fixture: ComponentFixture<ProfilesComponent>;
  let mockWsgAdminService: Partial<WsgAdminService>;
  let mockMetadataBackendService: Partial<MetadataBackendService>;

  const mockRegisteredProfiles: RegisteredMetadataProfileDto[] = [
    {
      id: 'rp1',
      url: 'http://test.com/profile1/md.json',
      title: [{ lang: 'de', value: 'Test Profile Store' }],
      creator: 'test-creator',
      profiles: ['p1'],
      modifiedAt: new Date()
    }
  ];

  const mockProfileData: MetadataProfileDto = {
    id: 'test-profile',
    label: [{ lang: 'de', value: 'Test Profile' }],
    groups: [],
    modifiedAt: new Date()
  };

  beforeEach(async () => {
    mockWsgAdminService = {
      selectedWorkspaceGroupSettings: {
        defaultSchemer: '',
        defaultPlayer: '',
        defaultEditor: '',
        profiles: [{ id: 'test-profile', label: 'Test Profile' }]
      } as WorkspaceGroupSettingsDto,
      profileStores: []
    };

    mockMetadataBackendService = {
      getRegisteredProfiles: jest.fn().mockReturnValue(of(mockRegisteredProfiles)),
      getMetadataProfile: jest.fn().mockReturnValue(of(mockProfileData))
    };

    await TestBed.configureTestingModule({
      imports: [
        MatCheckboxModule,
        MatFormFieldModule,
        MatProgressSpinnerModule,
        MatExpansionModule,
        TranslateModule.forRoot(),
        ProfilesComponent
      ],
      providers: [
        { provide: WsgAdminService, useValue: mockWsgAdminService },
        { provide: MetadataBackendService, useValue: mockMetadataBackendService }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfilesComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load profiles on init', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    // Wait for async subscribe callback to complete
    await new Promise<void>(resolve => { setTimeout(() => resolve(), 10); });
    fixture.detectChanges();

    expect(mockMetadataBackendService.getRegisteredProfiles).toHaveBeenCalled();
    expect(mockMetadataBackendService.getMetadataProfile).toHaveBeenCalled();
    expect(component.isLoading).toBe(false);
    expect(component.isError).toBe(false);
    expect(component.profileStoresWithProfiles.length).toBe(1);
    expect(component.profilesSelected.length).toBeGreaterThan(0);
    expect(component.profilesSelected[0].id).toBe('test-profile');
  });

  it('should set isError to true if registered profiles fetch fails', async () => {
    (mockMetadataBackendService.getRegisteredProfiles as jest.Mock).mockReturnValue(of(true));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.isError).toBe(true);
    expect(component.isLoading).toBe(false);
  });

  it('isChecked should return true if profile is selected', () => {
    component.profilesSelected = [{ id: 'p1', label: 'P1' }];
    expect(component.isChecked('p1')).toBe(true);
    expect(component.isChecked('p2')).toBe(false);
  });

  it('changeSelection should add profile if checked', () => {
    jest.spyOn(component.hasChanged, 'emit');
    const event = {
      checked: true,
      source: { id: 'new-p', name: 'New P' }
    } as unknown as MatCheckboxChange;

    component.changeSelection(event);

    expect(component.profilesSelected.find(p => p.id === 'new-p')).toBeTruthy();
    expect(component.hasChanged.emit).toHaveBeenCalledWith(component.profilesSelected);
  });

  it('changeSelection should remove profile if unchecked', () => {
    component.profilesSelected = [{ id: 'p1', label: 'P1' }, { id: 'p2', label: 'P2' }];
    jest.spyOn(component.hasChanged, 'emit');
    const event = {
      checked: false,
      source: { id: 'p1', name: 'P1' }
    } as unknown as MatCheckboxChange;

    component.changeSelection(event);

    expect(component.profilesSelected.length).toBe(1);
    expect(component.profilesSelected[0].id).toBe('p2');
    expect(component.hasChanged.emit).toHaveBeenCalledWith(component.profilesSelected);
  });

  describe('Template rendering', () => {
    it('should show spinner when loading', () => {
      component.isLoading = true;
      fixture.detectChanges();

      const spinner = fixture.debugElement.query(By.css('mat-spinner'));
      expect(spinner).toBeTruthy();
    });

    it('should show error message when isError is true', async () => {
      (mockMetadataBackendService.getRegisteredProfiles as jest.Mock).mockReturnValue(of(true));
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(component.isError).toBe(true);
      const error = fixture.debugElement.query(By.css('mat-error'));
      expect(error).toBeTruthy();
    });

    it('should show expansion panel when profiles are loaded', async () => {
      fixture.detectChanges();
      await fixture.whenStable();
      // Wait for async subscribe callback to complete
      await new Promise<void>(resolve => { setTimeout(() => resolve(), 10); });
      fixture.detectChanges();

      expect(component.isLoading).toBe(false);
      expect(component.profileStoresWithProfiles.length).toBe(1);

      const panel = fixture.debugElement.query(By.css('mat-expansion-panel'));
      expect(panel).toBeTruthy();

      const checkbox = fixture.debugElement.query(By.css('mat-checkbox'));
      expect(checkbox).toBeTruthy();
    });
  });
});
