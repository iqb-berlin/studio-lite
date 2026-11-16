import { Injectable } from '@angular/core';
import { AbstractControl, FormGroupDirective, NgForm } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

/**
 * Marks a field as soon as it holds something that does not pass, not only once it has been left.
 * Material's default waits for the field to be touched: a stored value that failed the rules held
 * saving back while nothing in the dialog was marked (#2147). An empty required field still waits
 * until it has been left, so that a dialog for something new does not open in red.
 */
@Injectable()
export class FilledErrorStateMatcher implements ErrorStateMatcher {
  // eslint-disable-next-line class-methods-use-this
  isErrorState(control: AbstractControl | null, form: FormGroupDirective | NgForm | null): boolean {
    if (!control || !control.invalid) return false;
    const filled = control.value !== null && control.value !== undefined && control.value !== '';
    return filled || control.touched || !!form?.submitted;
  }
}
