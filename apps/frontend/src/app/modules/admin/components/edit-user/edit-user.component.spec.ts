import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { provideHttpClient } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { of } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { EditUserComponent } from './edit-user.component';
import { EditUserComponentData } from '../../models/edit-user-component-data.type';
import { BackendService } from '../../../../services/backend.service';
import { AppService } from '../../../../services/app.service';

describe('EditUserComponent', () => {
  let component: EditUserComponent;
  let fixture: ComponentFixture<EditUserComponent>;
  let backendService: jest.Mocked<BackendService>;

  const mockDialogData: EditUserComponentData = {
    newUser: false,
    name: 'testuser',
    password: 'testpass',
    description: 'Test Description',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    isAdmin: false,
    emailApproved: true
  };

  const createTestModule = (dialogData: EditUserComponentData) => {
    const backendServiceMock = {
      getEmailTemplate: jest.fn().mockReturnValue(of({
        emailSubject: 'Test Subject',
        emailBody: 'Hello {{firstname}} {{lastname}}, your user is {{user}} and password is {{password}}'
      }))
    };

    const appServiceMock = {};

    return TestBed.configureTestingModule({
      imports: [
        EditUserComponent,
        MatInputModule,
        MatIconModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatProgressSpinnerModule,
        TranslateModule.forRoot()
      ],
      providers: [
        provideHttpClient(),
        { provide: BackendService, useValue: backendServiceMock },
        { provide: AppService, useValue: appServiceMock },
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
        { provide: 'SERVER_URL', useValue: environment.backendUrl }
      ]
    });
  };

  beforeEach(async () => {
    await createTestModule(mockDialogData).compileComponents();

    backendService = TestBed.inject(BackendService) as jest.Mocked<BackendService>;

    fixture = TestBed.createComponent(EditUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with dialog data', () => {
    expect(component.editUserForm.get('name')?.value).toBe('testuser');
    expect(component.editUserForm.get('firstName')?.value).toBe('John');
    expect(component.editUserForm.get('lastName')?.value).toBe('Doe');
    expect(component.editUserForm.get('email')?.value).toBe('john.doe@example.com');
    expect(component.editUserForm.get('description')?.value).toBe('Test Description');
    expect(component.editUserForm.get('isAdmin')?.value).toBe(false);
    expect(component.editUserForm.get('password')?.value).toBe('testpass');
  });

  it('should validate name field with pattern', () => {
    const nameControl = component.editUserForm.get('name');

    nameControl?.setValue('ab');
    expect(nameControl?.valid).toBe(false);

    nameControl?.setValue('validuser');
    expect(nameControl?.valid).toBe(true);

    nameControl?.setValue('UserWithCaps');
    expect(nameControl?.valid).toBe(false);
  });

  it('should not require password for existing users', () => {
    const passwordControl = component.editUserForm.get('password');
    passwordControl?.setValue('');
    expect(passwordControl?.hasError('required')).toBe(false);
  });

  it('should load email template on init', () => {
    expect(backendService.getEmailTemplate).toHaveBeenCalled();
    expect(component.emailTemplate).toBeDefined();
    expect(component.emailTemplate.emailSubject).toBe('Test Subject');
  });

  it('should toggle password input type', () => {
    const input = document.createElement('input');
    input.type = 'password';

    component.setPasswordInputType(input);
    expect(input.type).toBe('text');

    component.setPasswordInputType(input);
    expect(input.type).toBe('password');
  });

  it('should generate password and set input type to text', () => {
    const input = document.createElement('input');
    input.type = 'password';

    component.setGeneratePassword(input);

    const generatedPassword = component.editUserForm.get('password')?.value;
    expect(generatedPassword).toBeDefined();
    expect(generatedPassword.length).toBe(8);
    expect(input.type).toBe('text');
  });

  it('should generate password with valid characters only', () => {
    const input = document.createElement('input');

    for (let i = 0; i < 10; i++) {
      component.setGeneratePassword(input);
      const password = component.editUserForm.get('password')?.value;

      // Check that password only contains characters from CHARSET
      const validChars = /^[ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!#$%&*\-_+=:?]+$/;
      expect(password).toMatch(validChars);
    }
  });

  it('should have all required form fields', () => {
    expect(component.editUserForm.get('name')).toBeDefined();
    expect(component.editUserForm.get('lastName')).toBeDefined();
    expect(component.editUserForm.get('firstName')).toBeDefined();
    expect(component.editUserForm.get('email')).toBeDefined();
    expect(component.editUserForm.get('description')).toBeDefined();
    expect(component.editUserForm.get('isAdmin')).toBeDefined();
    expect(component.editUserForm.get('password')).toBeDefined();
  });

  it('should have emailTemplate defined after init', () => {
    expect(component.emailTemplate).toBeDefined();
    expect(component.emailTemplate.emailSubject).toBe('Test Subject');
    expect(component.emailTemplate.emailBody).toContain('{{firstname}}');
  });
});

describe('EditUserComponent (new user)', () => {
  let fixture: ComponentFixture<EditUserComponent>;
  let component: EditUserComponent;

  const newUserData: EditUserComponentData = {
    newUser: true,
    name: 'newuser',
    password: '',
    description: '',
    firstName: '',
    lastName: '',
    email: '',
    isAdmin: false,
    emailApproved: false
  };

  beforeEach(async () => {
    const backendServiceMock = {
      getEmailTemplate: jest.fn().mockReturnValue(of({
        emailSubject: 'Test Subject',
        emailBody: 'Hello {{firstname}} {{lastname}}, your user is {{user}} and password is {{password}}'
      }))
    };

    await TestBed.configureTestingModule({
      imports: [
        EditUserComponent,
        MatInputModule,
        MatIconModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatProgressSpinnerModule,
        TranslateModule.forRoot()
      ],
      providers: [
        provideHttpClient(),
        { provide: BackendService, useValue: backendServiceMock },
        { provide: AppService, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: newUserData },
        { provide: 'SERVER_URL', useValue: environment.backendUrl }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EditUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should require password for new users', () => {
    const passwordControl = component.editUserForm.get('password');
    expect(passwordControl?.hasError('required')).toBe(true);
  });
});
