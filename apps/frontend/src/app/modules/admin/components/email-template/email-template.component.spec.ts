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
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { EmailTemplateDto } from '@studio-lite-lib/api-dto';
import { EmailTemplateComponent } from './email-template.component';
import { environment } from '../../../../../environments/environment';
import { BackendService } from '../../../../services/backend.service';

describe('EmailTemplateComponent', () => {
  let component: EmailTemplateComponent;
  let fixture: ComponentFixture<EmailTemplateComponent>;
  let backendService: jest.Mocked<BackendService>;
  let snackBar: jest.Mocked<MatSnackBar>;

  beforeEach(async () => {
    const backendServiceMock = {
      getEmailTemplate: jest.fn(),
      setEmailTemplate: jest.fn()
    };

    const snackBarMock = {
      open: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        EmailTemplateComponent,
        TranslateModule.forRoot(),
        ReactiveFormsModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatTooltipModule
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

    backendService.getEmailTemplate.mockReturnValue(of({
      emailSubject: 'Welcome {{user}}',
      emailBody: 'Hello {{firstname}} {{lastname}}, your password is {{password}}'
    }));

    fixture = TestBed.createComponent(EmailTemplateComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.configForm).toBeDefined();
    expect(component.configForm.get('emailSubject')).toBeDefined();
    expect(component.configForm.get('emailBody')).toBeDefined();
  });

  it('should initialize dataChanged as false', () => {
    expect(component.dataChanged).toBe(false);
  });

  it('should load email template on init', fakeAsync(() => {
    component.ngOnInit();
    tick(200);
    expect(backendService.getEmailTemplate).toHaveBeenCalled();
  }));

  it('should update form fields with loaded template', fakeAsync(() => {
    component.ngOnInit();
    tick(200);
    fixture.detectChanges();
    expect(component.configForm.get('emailSubject')?.value).toBe('Welcome {{user}}');
    expect(component.configForm.get('emailBody')?.value)
      .toBe('Hello {{firstname}} {{lastname}}, your password is {{password}}');
  }));

  it('should set dataChanged flag when form values change', fakeAsync(() => {
    component.ngOnInit();
    tick(200);
    component.dataChanged = false;
    component.configForm.get('emailSubject')?.setValue('New Subject');
    tick(100);
    expect(component.dataChanged).toBe(true);
  }));

  it('should save email template successfully', fakeAsync(() => {
    backendService.setEmailTemplate.mockReturnValue(of(true));
    component.ngOnInit();
    tick(200);

    component.configForm.patchValue({
      emailSubject: 'Test Subject',
      emailBody: 'Test Body'
    });
    component.dataChanged = true;
    component.saveData();
    tick(100);

    const expectedTemplate: EmailTemplateDto = {
      emailSubject: 'Test Subject',
      emailBody: 'Test Body'
    };

    expect(backendService.setEmailTemplate).toHaveBeenCalledWith(expectedTemplate);
    tick(100);
    expect(snackBar.open).toHaveBeenCalled();
    expect(component.dataChanged).toBe(false);
  }));

  it('should show error message when save fails', fakeAsync(() => {
    backendService.setEmailTemplate.mockReturnValue(of(false));
    component.ngOnInit();
    tick(200);

    component.saveData();
    tick(100);

    expect(backendService.setEmailTemplate).toHaveBeenCalled();
    tick(100);
    expect(snackBar.open).toHaveBeenCalled();
  }));

  it('should handle null email template response', fakeAsync(() => {
    backendService.getEmailTemplate.mockReturnValue(of(null as unknown as EmailTemplateDto));

    const newFixture = TestBed.createComponent(EmailTemplateComponent);
    const newComponent = newFixture.componentInstance;
    newComponent.ngOnInit();
    tick(200);

    expect(newComponent.configForm.get('emailSubject')?.value).toBe('');
    expect(newComponent.configForm.get('emailBody')?.value).toBe('');
  }));

  it('should properly construct EmailTemplateDto when saving', fakeAsync(() => {
    backendService.setEmailTemplate.mockReturnValue(of(true));
    component.ngOnInit();
    tick(200);

    component.configForm.patchValue({
      emailSubject: 'Custom Subject',
      emailBody: 'Custom Body with {{placeholder}}'
    });

    component.saveData();
    tick(100);

    const callArgs = backendService.setEmailTemplate.mock.calls[0][0];
    expect(callArgs).toEqual({
      emailSubject: 'Custom Subject',
      emailBody: 'Custom Body with {{placeholder}}'
    });
  }));

  it('should handle empty form values when saving', fakeAsync(() => {
    backendService.setEmailTemplate.mockReturnValue(of(true));
    component.ngOnInit();
    tick(200);

    component.configForm.patchValue({
      emailSubject: '',
      emailBody: ''
    });

    component.saveData();
    tick(100);

    const callArgs = backendService.setEmailTemplate.mock.calls[0][0];
    expect(callArgs.emailSubject).toBe('');
    expect(callArgs.emailBody).toBe('');
  }));

  it('should not save if configForm is null', () => {
    component.configForm = null as unknown as typeof component.configForm;
    component.saveData();
    expect(backendService.setEmailTemplate).not.toHaveBeenCalled();
  });
});
