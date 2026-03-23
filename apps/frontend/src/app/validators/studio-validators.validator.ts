import { AbstractControl, ValidationErrors } from '@angular/forms';

export class StudioValidators {
  static jsonValidator(control: AbstractControl): ValidationErrors | null {
    try {
      if (control.value) {
        JSON.parse(control.value);
      }
      return null;
    } catch (e) {
      return { invalidJson: true };
    }
  }
}
