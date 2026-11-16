import {
  AbstractControl, FormControl, ValidationErrors, Validators
} from '@angular/forms';

/** Blanks around an address come with copying it and are never part of it (#2147). */
export const trimEmail = <T>(email: T): T | string => (typeof email === 'string' ? email.trim() : email);

/** As `Validators.email`, but blanks around the address do not count: they are cut off before it is sent. */
export const emailValidator = (control: AbstractControl): ValidationErrors | null => Validators
  .email(new FormControl(trimEmail(control.value)));

/** The data as it goes to the API: with the address trimmed, and untouched where it carries none. */
export const withTrimmedEmail = <T extends { email?: string }>(data: T): T => (
  typeof data.email === 'string' ? { ...data, email: data.email.trim() } : data
);
