import { FormControl, FormGroup } from '@angular/forms';
import { matchesControl } from './matches-control.utils';

describe('matchesControl', () => {
  const build = () => new FormGroup({
    first: new FormControl(''),
    second: new FormControl('', matchesControl('first'))
  });

  it('refuses a value that differs from the named sibling', () => {
    const form = build();
    form.controls.first.setValue('secret');
    form.controls.second.setValue('secrat');
    expect(form.controls.second.errors).toEqual({ mismatch: true });

    form.controls.second.setValue('secret');
    expect(form.controls.second.errors).toBeNull();
  });

  it('compares with the sibling as it is when the control is validated', () => {
    const form = build();
    form.controls.first.setValue('secret');
    form.controls.second.setValue('secret');
    form.controls.first.setValue('other');
    form.controls.second.updateValueAndValidity();
    expect(form.controls.second.errors).toEqual({ mismatch: true });
  });
});
