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
      <h1 mat-dialog-title>{{typedData.title}}</h1>
      <mat-dialog-content>
        <form [formGroup]="textInputForm" fxLayout="column">
          <mat-form-field>
            <input matInput formControlName="text" [placeholder]="typedData.prompt">
          </mat-form-field>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions>
        <button mat-raised-button color="primary" type="submit"
                [mat-dialog-close]="textInputForm.get('text')?.value"
                [disabled]="textInputForm.invalid">
          {{typedData.okButtonLabel}}
        </button>
        <button mat-raised-button [mat-dialog-close]="false">Abbrechen</button>
      </mat-dialog-actions>
    </div>
  `
})
export class InputTextComponent {
  textInputForm: UntypedFormGroup;
  typedData: InputTextData;

  constructor(private fb: UntypedFormBuilder,
              @Inject(MAT_DIALOG_DATA) public data: unknown) {
    this.typedData = data as InputTextData;
    this.textInputForm = this.fb.group({
      text: this.fb.control(this.typedData.default, [Validators.required])
    });
  }
}
