import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';

export interface InputTextData {
  title: string,
  prompt: string,
  default: string,
  okButtonLabel: string
}

@Component({
  template: `
    <div fxLayout="column" style="height: 100%">
      <h1 mat-dialog-title>{{data.title}}</h1>
      <mat-dialog-content>
        <form [formGroup]="textInputForm" fxLayout="column">
          <mat-form-field>
            <input matInput formControlName="text" [placeholder]="data.prompt">
          </mat-form-field>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions>
        <button mat-raised-button color="primary" type="submit"
                [mat-dialog-close]="textInputForm.get('text')?.value" [disabled]="textInputForm.invalid">{{data.okButtonLabel}}</button>
        <button mat-raised-button [mat-dialog-close]="false">Abbrechen</button>
      </mat-dialog-actions>
    </div>
  `
})
export class InputTextComponent {
  textInputForm: UntypedFormGroup;

  constructor(private fb: UntypedFormBuilder,
              @Inject(MAT_DIALOG_DATA) public data: InputTextData) {
    this.textInputForm = this.fb.group({
      text: this.fb.control(data.default, [Validators.required]),
    });
  }
}
