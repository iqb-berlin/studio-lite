import { FormControl } from '@angular/forms';
import { emailValidator, trimEmail, withTrimmedEmail } from './email.utils';

describe('emailValidator', () => {
  // An address copied with a blank behind it made the account unsaveable (#2147).
  it('accepts an address with blanks around it (#2147)', () => {
    expect(emailValidator(new FormControl(' someone@example.org '))).toBeNull();
  });

  it('refuses what is no address', () => {
    expect(emailValidator(new FormControl('kein-at'))).toEqual({ email: true });
    expect(emailValidator(new FormControl('a@example.org; b@example.org'))).toEqual({ email: true });
  });

  it('accepts a field without an address', () => {
    expect(emailValidator(new FormControl(''))).toBeNull();
    expect(emailValidator(new FormControl(null))).toBeNull();
  });
});

describe('trimEmail', () => {
  it('cuts the blanks off an address and passes on what is none', () => {
    expect(trimEmail(' someone@example.org ')).toBe('someone@example.org');
    expect(trimEmail(null)).toBeNull();
    expect(trimEmail(undefined)).toBeUndefined();
  });
});

describe('withTrimmedEmail', () => {
  it('trims the address and keeps the other fields', () => {
    expect(withTrimmedEmail({ id: 4, email: ' someone@example.org ' }))
      .toEqual({ id: 4, email: 'someone@example.org' });
  });

  // changed user data carries only what has changed: an added `email` would overwrite the stored one
  it('adds no address where the data carries none', () => {
    const unchanged: { id: number; email?: string } = { id: 4 };
    expect(Object.keys(withTrimmedEmail(unchanged))).toEqual(['id']);
  });
});
