import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
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
import { BackendService as ReadBackendService } from '../../../../services/backend.service';
import { BackendService as WriteBackendService } from '../../services/backend.service';

describe('AppConfigComponent', () => {
  let component: AppConfigComponent;
  let fixture: ComponentFixture<AppConfigComponent>;
  let readBackendService: jest.Mocked<ReadBackendService>;
  let writeBackendService: jest.Mocked<WriteBackendService>;
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
    const readBackendServiceMock = {
      getConfig: jest.fn()
    };

    const writeBackendServiceMock = {
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
        MatSelectModule,
        NoopAnimationsModule
      ],
      providers: [
        provideHttpClient(),
        { provide: ReadBackendService, useValue: readBackendServiceMock },
        { provide: WriteBackendService, useValue: writeBackendServiceMock },
        { provide: MatSnackBar, useValue: snackBarMock },
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        }
      ]
    }).compileComponents();

    readBackendService = TestBed.inject(ReadBackendService) as jest.Mocked<ReadBackendService>;
    writeBackendService = TestBed.inject(WriteBackendService) as jest.Mocked<WriteBackendService>;
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
    readBackendService.getConfig.mockReturnValue(of(mockConfig));

    fixture = TestBed.createComponent(AppConfigComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.configForm).toBeDefined();
    expect(component.configForm.get('appTitle')).toBeDefined();
    expect(component.configForm.get('introHtml')).toBeDefined();
    expect(component.configForm.get('imprintHtml')).toBeDefined();
    expect(component.configForm.get('globalWarningText')).toBeDefined();
    expect(component.configForm.get('globalWarningExpiredDay')).toBeDefined();
    expect(component.configForm.get('globalWarningExpiredHour')).toBeDefined();
  });

  it('should have expiredHours array with 24 elements', () => {
    expect(component.expiredHours).toBeDefined();
    expect(component.expiredHours.length).toBe(24);
    expect(component.expiredHours[0]).toBe(0);
    expect(component.expiredHours[23]).toBe(23);
  });

  it('should load config data on init', done => {
    fixture.detectChanges();
    setTimeout(() => {
      expect(readBackendService.getConfig).toHaveBeenCalled();
      done();
    }, 100);
  });

  it('should update form fields with loaded data', done => {
    fixture.detectChanges();
    setTimeout(() => {
      expect(component.configForm.get('appTitle')?.value).toBe('Test App');
      expect(component.configForm.get('introHtml')?.value).toBe('<p>Test Intro</p>');
      expect(component.configForm.get('imprintHtml')?.value).toBe('<p>Test Imprint</p>');
      expect(component.configForm.get('globalWarningText')?.value).toBe('Test Warning');
      done();
    }, 100);
  });

  it('should set dataChanged flag when form values change', done => {
    fixture.detectChanges();
    setTimeout(() => {
      component.dataChanged = false;
      component.configForm.get('appTitle')?.setValue('New Title');
      setTimeout(() => {
        expect(component.dataChanged).toBe(true);
        done();
      }, 50);
    }, 100);
  });

  it('should save config data successfully', done => {
    writeBackendService.setAppConfig.mockReturnValue(of(true));
    fixture.detectChanges();

    setTimeout(() => {
      component.dataChanged = true;
      component.saveData();

      expect(writeBackendService.setAppConfig).toHaveBeenCalled();
      setTimeout(() => {
        expect(snackBar.open).toHaveBeenCalledWith(
          expect.any(String),
          '',
          { duration: 3000 }
        );
        expect(component.dataChanged).toBe(false);
        done();
      }, 50);
    }, 100);
  });

  it('should show error message when save fails', done => {
    writeBackendService.setAppConfig.mockReturnValue(of(false));
    fixture.detectChanges();

    setTimeout(() => {
      component.saveData();

      expect(writeBackendService.setAppConfig).toHaveBeenCalled();
      setTimeout(() => {
        expect(snackBar.open).toHaveBeenCalledWith(
          expect.any(String),
          expect.any(String),
          { duration: 3000 }
        );
        done();
      }, 50);
    }, 100);
  });

  it('should check if warning is expired', done => {
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
    readBackendService.getConfig.mockReturnValue(of(pastConfig));

    const newFixture = TestBed.createComponent(AppConfigComponent);
    const newComponent = newFixture.componentInstance;
    newFixture.detectChanges();

    setTimeout(() => {
      expect(newComponent.warningIsExpired).toBe(true);
      done();
    }, 100);
  });
});
