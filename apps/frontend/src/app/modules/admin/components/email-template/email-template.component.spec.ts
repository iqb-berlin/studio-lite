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
import { of, Subject } from 'rxjs';
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
      emailSubject: { de: 'Willkommen {{user}}', en: 'Welcome {{user}}', fr: 'Bienvenue {{user}}' },
      emailBody: { de: 'Hallo {{firstname}} {{lastname}}, Ihr Kennwort ist {{password}}' }
    }));

    fixture = TestBed.createComponent(EmailTemplateComponent);
    component = fixture.componentInstance;
  });

  it('should update form fields with loaded template', fakeAsync(() => {
    component.ngOnInit();
    tick(200);
    fixture.detectChanges();
    expect(component.configForm.get('de.emailSubject')?.value).toBe('Willkommen {{user}}');
    expect(component.configForm.get('en.emailSubject')?.value).toBe('Welcome {{user}}');
    expect(component.configForm.get('de.emailBody')?.value)
      .toBe('Hallo {{firstname}} {{lastname}}, Ihr Kennwort ist {{password}}');
    expect(component.configForm.get('en.emailBody')?.value).toBe('');
  }));

  it('should set dataChanged flag when form values change', fakeAsync(() => {
    component.ngOnInit();
    tick(200);
    component.dataChanged = false;
    component.configForm.get('de.emailSubject')?.setValue('New Subject');
    tick(100);
    expect(component.dataChanged).toBe(true);
  }));

  // Each language has its texts; a language the studio does not offer keeps its own (#2186)
  it('should save the template of every language and keep that of a language the form does not show', fakeAsync(() => {
    backendService.setEmailTemplate.mockReturnValue(of(true));
    component.ngOnInit();
    tick(200);

    component.configForm.patchValue({
      de: { emailSubject: 'Betreff' },
      en: { emailSubject: 'Subject', emailBody: 'Body' }
    });
    component.dataChanged = true;
    component.saveData();
    tick(100);

    const expectedTemplate: EmailTemplateDto = {
      emailSubject: { de: 'Betreff', en: 'Subject', fr: 'Bienvenue {{user}}' },
      emailBody: { de: 'Hallo {{firstname}} {{lastname}}, Ihr Kennwort ist {{password}}', en: 'Body' }
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
    expect(snackBar.open).toHaveBeenCalledWith('email-template.template-not-saved', 'error', expect.anything());
  }));

  // Empty fields after a failed load looked like no template stored, with saving grey and no reason given (#2188).
  it('should say that the template was not loaded and offer no form to save', () => {
    backendService.getEmailTemplate.mockReturnValue(of(null));
    component.updateFormFields();
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('[data-cy="admin-email-template-not-loaded"]')).not.toBeNull();
    expect(element.querySelector('[data-cy="admin-email-template-save-button"]')).toBeNull();
  });

  it('should not save if configForm is null', () => {
    component.configForm = null as unknown as typeof component.configForm;
    component.saveData();
    expect(backendService.setEmailTemplate).not.toHaveBeenCalled();
  });

  // #2094: what is entered while the save is under way was not sent, and a second save waits
  it('keeps an entry made while saving unsaved and does not save twice meanwhile', fakeAsync(() => {
    const answer = new Subject<boolean>();
    backendService.setEmailTemplate.mockReturnValue(answer);
    component.ngOnInit();
    tick();
    component.configForm.get('de.emailSubject')?.setValue('Gesendet');
    component.saveData();
    component.configForm.get('de.emailSubject')?.setValue('Danach');
    component.saveData();
    answer.next(true);

    expect(backendService.setEmailTemplate).toHaveBeenCalledTimes(1);
    expect(component.dataChanged).toBe(true);
  }));
});
