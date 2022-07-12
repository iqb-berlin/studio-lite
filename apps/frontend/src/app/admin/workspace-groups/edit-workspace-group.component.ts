import { Component, Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

export type EditWorkspaceGroupComponentData = {
  title: string,
  name: string,
  saveButtonLabel: string
};

@Component({
  template: `
    <form [formGroup]="editWorkspaceGroupForm">
      <h1 mat-dialog-title>{{data.title}}</h1>

      <mat-dialog-content fxLayout="column">
        <mat-form-field>
          <input matInput formControlName="name" placeholder="Name" [value]="data.name">
        </mat-form-field>
      </mat-dialog-content>

      <mat-dialog-actions>
        <button mat-raised-button color="primary"
                type="submit" [mat-dialog-close]="editWorkspaceGroupForm"
                [disabled]="editWorkspaceGroupForm.invalid">{{data.saveButtonLabel}}
        </button>
        <button mat-raised-button [mat-dialog-close]="false">Abbrechen</button>
      </mat-dialog-actions>

    </form>
  `
})
export class EditWorkspaceGroupComponent {
  editWorkspaceGroupForm: UntypedFormGroup;

  constructor(private fb: UntypedFormBuilder,
              @Inject(MAT_DIALOG_DATA) public data: EditWorkspaceGroupComponentData) {
    this.editWorkspaceGroupForm = this.fb.group({
      name: this.fb.control(this.data.name, [Validators.required, Validators.minLength(3)])
    });
  }
}
