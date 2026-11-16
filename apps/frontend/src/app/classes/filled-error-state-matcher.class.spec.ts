import { FormControl, Validators } from '@angular/forms';
import { FilledErrorStateMatcher } from './filled-error-state-matcher.class';

describe('FilledErrorStateMatcher', () => {
  const matcher = new FilledErrorStateMatcher();

  // A stored address that failed held saving back while nothing in the dialog was marked (#2147).
  it('marks a field that holds a failing value before it has been left (#2147)', () => {
    expect(matcher.isErrorState(new FormControl('kein-at', Validators.email), null)).toBe(true);
  });

  it('leaves an empty required field alone until it has been left', () => {
    const control = new FormControl('', Validators.required);
    expect(matcher.isErrorState(control, null)).toBe(false);

    control.markAsTouched();
    expect(matcher.isErrorState(control, null)).toBe(true);
  });

  it('does not mark a field whose value passes', () => {
    const control = new FormControl('someone@example.org', Validators.email);
    control.markAsTouched();
    expect(matcher.isErrorState(control, null)).toBe(false);
  });
});
