import { ValidatorFn } from '@angular/forms';

/**
 * Valid only while the control holds the same value as its sibling `name` in the form group; the error
 * is `mismatch`. The sibling does not know about it: whoever sets this validator revalidates the control
 * when the sibling changes.
 */
export const matchesControl = (name: string): ValidatorFn => control => (
  control.parent && control.value !== control.parent.get(name)?.value ? { mismatch: true } : null
);
