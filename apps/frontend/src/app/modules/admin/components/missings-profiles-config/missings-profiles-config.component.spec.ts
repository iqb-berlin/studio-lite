import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { BackendService } from '../../services/backend.service';
import { MissingsProfilesConfigComponent } from './missings-profiles-config.component';

describe('MissingsProfilesConfigComponent', () => {
  let component: MissingsProfilesConfigComponent;
  let fixture: ComponentFixture<MissingsProfilesConfigComponent>;
  let backendService: jest.Mocked<Pick<BackendService, 'getMissingsProfiles' | 'setMissingsProfiles'>>;
  let snackBar: jest.Mocked<Pick<MatSnackBar, 'open'>>;

  beforeEach(async () => {
    backendService = {
      getMissingsProfiles: jest.fn(),
      setMissingsProfiles: jest.fn()
    };
    snackBar = {
      open: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        ReactiveFormsModule,
        NoopAnimationsModule
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

    backendService.getMissingsProfiles.mockReturnValue(of([]));

    fixture = TestBed.createComponent(MissingsProfilesConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('updates form fields and marks dataChanged on value change', () => {
    backendService.getMissingsProfiles.mockReturnValue(of([
      { label: 'IQB-Standard', missings: '[1]' }
    ]));

    component.updateFormFields();

    expect(component.configForm.get('iqbStandardMissings')?.value).toBe('[1]');
    expect(component.dataChanged).toBe(false);

    component.configForm.get('iqbStandardMissings')?.setValue('[2]');
    expect(component.dataChanged).toBe(true);
  });

  it('saves valid JSON and resets dataChanged on success', () => {
    backendService.setMissingsProfiles.mockReturnValue(of(true));
    component.dataChanged = true;
    component.configForm.get('iqbStandardMissings')?.setValue('[]');

    component.saveData();

    expect(backendService.setMissingsProfiles).toHaveBeenCalledWith([
      { label: 'IQB-Standard', missings: '[]' }
    ]);
    expect(snackBar.open).toHaveBeenCalledWith(
      'missings-profiles-config.profiles-saved',
      '',
      { duration: 3000 }
    );
    expect(component.dataChanged).toBe(false);
  });

  it('shows error when saving fails', () => {
    backendService.setMissingsProfiles.mockReturnValue(of(false));
    component.configForm.get('iqbStandardMissings')?.setValue('[]');

    component.saveData();

    expect(snackBar.open).toHaveBeenCalledWith(
      'missings-profiles-config.profiles-not-saved',
      'error',
      { duration: 3000 }
    );
  });

  it('shows error on invalid JSON', () => {
    component.configForm.get('iqbStandardMissings')?.setValue('{invalid');

    component.saveData();

    expect(snackBar.open).toHaveBeenCalledWith(
      'missings-profiles-config.not-valid-json',
      'error',
      { duration: 3000 }
    );
  });
});
