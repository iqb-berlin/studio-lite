import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ChangePasswordComponent } from './change-password.component';

describe('ChangePasswordComponent', () => {
  let component: ChangePasswordComponent;
  let fixture: ComponentFixture<ChangePasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        TranslateModule.forRoot()
      ],
      providers: [
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ChangePasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with three password fields', () => {
    expect(component.changePasswordForm).toBeTruthy();
    expect(component.changePasswordForm.get('pw_old')).toBeTruthy();
    expect(component.changePasswordForm.get('pw_new1')).toBeTruthy();
    expect(component.changePasswordForm.get('pw_new2')).toBeTruthy();
  });

  it('should require all password fields', () => {
    const form = component.changePasswordForm;
    expect(form.valid).toBe(false);

    form.get('pw_old')?.setValue('');
    form.get('pw_new1')?.setValue('');
    form.get('pw_new2')?.setValue('');

    expect(form.get('pw_old')?.hasError('required')).toBe(true);
    expect(form.get('pw_new1')?.hasError('required')).toBe(true);
    expect(form.get('pw_new2')?.hasError('required')).toBe(true);
  });

  it('should validate minimum length of 3 characters', () => {
    const form = component.changePasswordForm;

    form.get('pw_old')?.setValue('ab');
    expect(form.get('pw_old')?.hasError('minlength')).toBe(true);

    form.get('pw_old')?.setValue('abc');
    expect(form.get('pw_old')?.hasError('minlength')).toBe(false);
  });

  it('should reject passwords with whitespace', () => {
    const form = component.changePasswordForm;

    form.get('pw_old')?.setValue('pass word');
    expect(form.get('pw_old')?.hasError('pattern')).toBe(true);

    form.get('pw_new1')?.setValue('new pass');
    expect(form.get('pw_new1')?.hasError('pattern')).toBe(true);

    form.get('pw_new2')?.setValue('confirm pass');
    expect(form.get('pw_new2')?.hasError('pattern')).toBe(true);
  });

  it('should accept valid passwords without whitespace', () => {
    const form = component.changePasswordForm;

    form.get('pw_old')?.setValue('oldpassword');
    form.get('pw_new1')?.setValue('newpassword');
    form.get('pw_new2')?.setValue('newpassword');

    expect(form.get('pw_old')?.valid).toBe(true);
    expect(form.get('pw_new1')?.valid).toBe(true);
    expect(form.get('pw_new2')?.valid).toBe(true);
    expect(form.valid).toBe(true);
  });

  it('should have empty initial values', () => {
    expect(component.changePasswordForm.get('pw_old')?.value).toBe('');
    expect(component.changePasswordForm.get('pw_new1')?.value).toBe('');
    expect(component.changePasswordForm.get('pw_new2')?.value).toBe('');
  });

  it('should accept special characters in passwords', () => {
    const form = component.changePasswordForm;

    form.get('pw_old')?.setValue('P@ssw0rd!');
    form.get('pw_new1')?.setValue('N3wP@ss!');
    form.get('pw_new2')?.setValue('N3wP@ss!');

    expect(form.valid).toBe(true);
  });
});
