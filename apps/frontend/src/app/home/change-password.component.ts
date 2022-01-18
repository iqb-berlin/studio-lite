import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  template: `
    <form [formGroup]="changePasswordForm">
      <h1 mat-dialog-title>Kennwort ändern</h1>

      <mat-dialog-content fxLayout="column">
        <p>
          Das Kennwort
          muss mindestens drei Zeichen lang sein und darf keine Leerzeichen enthalten.
        </p>
        <mat-form-field>
          <mat-label>Altes Kennwort</mat-label>
          <input matInput type="password" formControlName="pw_old" placeholder="Kennwort">
        </mat-form-field>
        <mat-form-field>
          <mat-label>Neues Kennwort</mat-label>
          <input matInput type="password" formControlName="pw_new1" placeholder="Kennwort">
        </mat-form-field>
        <mat-form-field>
          <mat-label>Neues Kennwort (Wiederholung)</mat-label>
          <input matInput type="password" formControlName="pw_new2" placeholder="Kennwort">
        </mat-form-field>
      </mat-dialog-content>

      <mat-dialog-actions>
        <button mat-raised-button color="primary" type="submit"
                [mat-dialog-close]="changePasswordForm"
                [disabled]="changePasswordForm.invalid ||
                    changePasswordForm.controls['pw_new1'].value !== changePasswordForm.controls['pw_new2'].value">
          Speichern
        </button>
        <button mat-raised-button [mat-dialog-close]="false">Abbrechen</button>
      </mat-dialog-actions>
    </form>
  `
})
export class ChangePasswordComponent {
  changePasswordForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.changePasswordForm = this.fb.group({
      pw_old: this.fb.control('', [Validators.required, Validators.minLength(3), Validators.pattern(/^\S+$/)]),
      pw_new1: this.fb.control('', [Validators.required, Validators.minLength(3), Validators.pattern(/^\S+$/)]),
      pw_new2: this.fb.control('', [Validators.required, Validators.minLength(3), Validators.pattern(/^\S+$/)])
    });
  }
}
