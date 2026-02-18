import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';
import { BackendService } from '../../services/backend.service';
import { ProfilesRegistryComponent } from './profiles-registry.component';

describe('ProfilesRegistryComponent', () => {
  let component: ProfilesRegistryComponent;
  let fixture: ComponentFixture<ProfilesRegistryComponent>;
  let backendService: jest.Mocked<Pick<BackendService, 'getProfilesRegistry' | 'setProfilesRegistry'>>;
  let snackBar: jest.Mocked<Pick<MatSnackBar, 'open'>>;

  beforeEach(async () => {
    backendService = {
      getProfilesRegistry: jest.fn(),
      setProfilesRegistry: jest.fn()
    };
    snackBar = {
      open: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        ReactiveFormsModule
      ],
      providers: [
        { provide: BackendService, useValue: backendService },
        { provide: MatSnackBar, useValue: snackBar }
      ]
    }).compileComponents();

    const translateService = TestBed.inject(TranslateService);
    jest.spyOn(translateService, 'instant').mockImplementation((key: string | string[]) => (
      Array.isArray(key) ? key.join(',') : key
    ));

    backendService.getProfilesRegistry.mockReturnValue(of({ csvUrl: '' }));

    fixture = TestBed.createComponent(ProfilesRegistryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('updates form fields and marks dataChanged on value change', () => {
    backendService.getProfilesRegistry.mockReturnValue(of({ csvUrl: 'url.csv' }));

    component.updateFormFields();

    expect(component.configForm.get('csvUrl')?.value).toBe('url.csv');
    expect(component.dataChanged).toBe(false);

    component.configForm.get('csvUrl')?.setValue('next.csv');
    expect(component.dataChanged).toBe(true);
  });

  it('saves data and resets dataChanged on success', () => {
    backendService.setProfilesRegistry.mockReturnValue(of(true));
    component.dataChanged = true;
    component.configForm.get('csvUrl')?.setValue('saved.csv');

    component.saveData();

    expect(backendService.setProfilesRegistry).toHaveBeenCalledWith({
      csvUrl: 'saved.csv'
    });
    expect(snackBar.open).toHaveBeenCalledWith(
      'profiles-registry.csv-url-saved',
      '',
      { duration: 3000 }
    );
    expect(component.dataChanged).toBe(false);
  });

  it('shows error when save fails', () => {
    backendService.setProfilesRegistry.mockReturnValue(of(false));
    component.configForm.get('csvUrl')?.setValue('saved.csv');

    component.saveData();

    expect(snackBar.open).toHaveBeenCalledWith(
      'profiles-registry.csv-url-not-saved',
      'error',
      { duration: 3000 }
    );
  });
});
