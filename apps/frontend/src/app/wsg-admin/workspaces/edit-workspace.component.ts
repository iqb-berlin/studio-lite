import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';

@Component({
  template: `
    <form [formGroup]="editWorkspaceForm" fxLayout="column">
      <h1 mat-dialog-title>{{data.title}}</h1>

      <mat-dialog-content fxLayout="column">
        <mat-form-field class="full-width">
          <input matInput formControlName="name" placeholder="Name" [value]="data.name">
        </mat-form-field>
      </mat-dialog-content>

      <mat-dialog-actions>
        <button mat-raised-button color="primary"
                type="submit" [mat-dialog-close]="editWorkspaceForm"
                [disabled]="editWorkspaceForm.invalid">{{data.saveButtonLabel}}
        </button>
        <button mat-raised-button [mat-dialog-close]="false">Abbrechen</button>
      </mat-dialog-actions>

    </form>
  `
})
export class EditWorkspaceComponent {
  editWorkspaceForm: UntypedFormGroup;

  constructor(private fb: UntypedFormBuilder,
              @Inject(MAT_DIALOG_DATA) public data: any) {
    this.editWorkspaceForm = this.fb.group({
      name: this.fb.control(this.data.name, [Validators.required, Validators.minLength(3)])
    });
  }
}
