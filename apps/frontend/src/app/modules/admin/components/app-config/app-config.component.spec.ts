import {
  ComponentFixture, fakeAsync, TestBed, tick
} from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { Pipe, PipeTransform } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { ConfigDto } from '@studio-lite-lib/api-dto';
import { AppConfigComponent } from './app-config.component';
import { environment } from '../../../../../environments/environment';
import { BackendService } from '../../services/backend.service';
import { defaultAppConfig } from '../../../../services/app.service';

describe('AppConfigComponent', () => {
  let component: AppConfigComponent;
  let fixture: ComponentFixture<AppConfigComponent>;
  let backendService: jest.Mocked<BackendService>;
  let snackBar: jest.Mocked<MatSnackBar>;

  @Pipe({
    name: 'toTime',
    standalone: false
  })
  class MockToTimePipe implements PipeTransform {
    // eslint-disable-next-line class-methods-use-this
    transform(): string {
      return '';
    }
  }

  beforeEach(async () => {
    const backendServiceMock = {
      getAppConfig: jest.fn(),
      setAppConfig: jest.fn()
    };

    const snackBarMock = {
      open: jest.fn()
    };

    await TestBed.configureTestingModule({
      declarations: [
        MockToTimePipe],
      imports: [
        AppConfigComponent,
        TranslateModule.forRoot(),
        ReactiveFormsModule,
        MatIconModule,
        MatNativeDateModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatInputModule,
        MatTooltipModule,
        MatSelectModule
      ],
      providers: [
        provideHttpClient(),
        { provide: BackendService, useValue: backendServiceMock },
        { provide: MatSnackBar, useValue: snackBarMock },
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        }
      ]
    }).compileComponents();

    backendService = TestBed.inject(BackendService) as jest.Mocked<BackendService>;
    snackBar = TestBed.inject(MatSnackBar) as jest.Mocked<MatSnackBar>;

    const mockConfig: ConfigDto = {
      appTitle: 'Test App',
      introHtml: '<p>Test Intro</p>',
      imprintHtml: '<p>Test Imprint</p>',
      emailSubject: 'Test Email Subject',
      emailBody: 'Test Email Body',
      globalWarningText: 'Test Warning',
      globalWarningExpiredDay: new Date('2026-12-31'),
      globalWarningExpiredHour: 12,
      hasUsers: true
    };
    backendService.getAppConfig.mockReturnValue(of(mockConfig));

    fixture = TestBed.createComponent(AppConfigComponent);
    component = fixture.componentInstance;
  });

  it('should update form fields with loaded data', () => {
    fixture.detectChanges();
    expect(component.configForm.get('appTitle')?.value).toBe('Test App');
    expect(component.configForm.get('introHtml')?.value).toBe('<p>Test Intro</p>');
    expect(component.configForm.get('imprintHtml')?.value).toBe('<p>Test Imprint</p>');
    expect(component.configForm.get('globalWarningText')?.value).toBe('Test Warning');
  });

  it('should convert globalWarningExpiredDay from string to Date object', () => {
    const stringConfig = {
      appTitle: 'Test App',
      introHtml: '<p>Test Intro</p>',
      imprintHtml: '<p>Test Imprint</p>',
      emailSubject: 'Test Email Subject',
      emailBody: 'Test Email Body',
      globalWarningText: 'Test Warning',
      globalWarningExpiredDay: '2026-12-31T00:00:00.000Z',
      globalWarningExpiredHour: 12,
      hasUsers: true
    };
    backendService.getAppConfig.mockReturnValue(of(stringConfig as unknown as ConfigDto));
    const stringFixture = TestBed.createComponent(AppConfigComponent);
    const stringComponent = stringFixture.componentInstance;
    stringFixture.detectChanges();

    expect(stringComponent.appConfig.globalWarningExpiredDay).toBeInstanceOf(Date);
    expect(stringComponent.configForm.get('globalWarningExpiredDay')?.value).toBeInstanceOf(Date);
  });

  it('should offer the default expiry day for a config without one', () => {
    backendService.getAppConfig.mockReturnValue(of({
      appTitle: 'Test App',
      introHtml: '',
      imprintHtml: '',
      emailSubject: '',
      emailBody: '',
      globalWarningText: 'Test Warning',
      hasUsers: true
    }));

    fixture.detectChanges();

    expect(component.configForm.get('globalWarningExpiredDay')?.value)
      .toEqual(defaultAppConfig.globalWarningExpiredDay);
  });

  describe('the shared default config (#1964)', () => {
    const editAndSave = (): void => {
      fixture.detectChanges();
      component.configForm.get('appTitle')?.setValue('New Title');
      backendService.setAppConfig.mockReturnValue(of(true));
      component.saveData();
    };

    it('should stay untouched when a config is loaded and saved', () => {
      editAndSave();
      expect(defaultAppConfig.appTitle).toBe('IQB-Studio');
    });

    it('should stay untouched when no config arrives and the form is saved', () => {
      backendService.getAppConfig.mockReturnValue(of(null));
      editAndSave();
      expect(defaultAppConfig.appTitle).toBe('IQB-Studio');
    });
  });

  // Saving a form without the stored config would replace that config (#1968).
  it('should say that the config was not loaded and offer no form to save', () => {
    backendService.getAppConfig.mockReturnValue(of(null));
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('[data-cy="admin-app-config-not-loaded"]')).not.toBeNull();
    expect(element.querySelector('[data-cy="admin-app-config-save-button"]')).toBeNull();
  });

  it('should offer the form to save once the config is loaded', () => {
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('[data-cy="admin-app-config-not-loaded"]')).toBeNull();
    expect(element.querySelector('[data-cy="admin-app-config-save-button"]')).not.toBeNull();
  });

  it('should show a text emptied on the server as empty (#1964)', () => {
    backendService.getAppConfig.mockReturnValue(of({ ...defaultAppConfig, introHtml: '' }));
    fixture.detectChanges();

    expect(component.configForm.get('introHtml')?.value).toBe('');
  });

  it('should save the parts of the config the form does not show (#1964)', () => {
    fixture.detectChanges();
    backendService.setAppConfig.mockReturnValue(of(true));
    component.saveData();

    expect(backendService.setAppConfig).toHaveBeenCalledWith(expect.objectContaining({
      emailSubject: 'Test Email Subject',
      emailBody: 'Test Email Body'
    }));
  });

  it('should set dataChanged flag when form values change', fakeAsync(() => {
    fixture.detectChanges();
    component.dataChanged = false;
    component.configForm.get('appTitle')?.setValue('New Title');
    tick(50);
    expect(component.dataChanged).toBe(true);
  }));

  it('should save config data successfully', fakeAsync(() => {
    backendService.setAppConfig.mockReturnValue(of(true));
    fixture.detectChanges();

    component.dataChanged = true;
    component.saveData();

    expect(backendService.setAppConfig).toHaveBeenCalled();
    tick(50);
    expect(snackBar.open).toHaveBeenCalledWith(
      expect.any(String),
      '',
      { duration: 3000 }
    );
    expect(component.dataChanged).toBe(false);
  }));

  it('should show error message when save fails', fakeAsync(() => {
    backendService.setAppConfig.mockReturnValue(of(false));
    fixture.detectChanges();

    component.saveData();

    expect(backendService.setAppConfig).toHaveBeenCalled();
    tick(50);
    expect(snackBar.open).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      { duration: 3000 }
    );
  }));

  it('should check if warning is expired', () => {
    const pastDate = new Date('2020-01-01');
    const pastConfig: ConfigDto = {
      appTitle: 'Test',
      introHtml: '',
      imprintHtml: '',
      emailSubject: '',
      emailBody: '',
      globalWarningText: 'Warning',
      globalWarningExpiredDay: pastDate,
      globalWarningExpiredHour: 12,
      hasUsers: true
    };
    backendService.getAppConfig.mockReturnValue(of(pastConfig));

    const newFixture = TestBed.createComponent(AppConfigComponent);
    const newComponent = newFixture.componentInstance;
    newFixture.detectChanges();

    expect(newComponent.warningIsExpired).toBe(true);
  });
});
