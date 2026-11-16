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

  // The button stayed grey without a word about the repetition (#2147).
  it('should say at the repetition that it differs from the new password (#2147)', () => {
    const form = component.changePasswordForm;
    form.get('pw_old')?.setValue('oldpassword');
    form.get('pw_new1')?.setValue('newpassword');
    form.get('pw_new2')?.setValue('newpasswort');
    fixture.detectChanges();

    expect(form.valid).toBe(false);
    const errors = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('mat-error'))
      .map(error => error.textContent?.trim());
    expect(errors).toEqual(['user.password-mismatch']);
  });

  it('should judge the repetition again when the new password changes', () => {
    const form = component.changePasswordForm;
    form.get('pw_old')?.setValue('oldpassword');
    form.get('pw_new1')?.setValue('newpassword');
    form.get('pw_new2')?.setValue('newpassword');
    expect(form.valid).toBe(true);

    form.get('pw_new1')?.setValue('otherpassword');
    expect(form.get('pw_new2')?.hasError('mismatch')).toBe(true);
    expect(form.valid).toBe(false);
  });
});
