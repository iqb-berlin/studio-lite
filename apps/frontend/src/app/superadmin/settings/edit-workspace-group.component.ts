import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  template: `
    <form [formGroup]="editWorkspaceGroupForm">
      <h1 mat-dialog-title>Gruppe für Arbeitsbereiche umbenennen</h1>

      <mat-dialog-content fxLayout="column">
        <mat-form-field>
          <input matInput formControlName="name" placeholder="Name" [value]="data.name">
        </mat-form-field>
      </mat-dialog-content>

      <mat-dialog-actions>
        <button mat-raised-button color="primary"
                type="submit" [mat-dialog-close]="editWorkspaceGroupForm"
                [disabled]="editWorkspaceGroupForm.invalid">Speichern
        </button>
        <button mat-raised-button [mat-dialog-close]="false">Abbrechen</button>
      </mat-dialog-actions>

    </form>
  `
})
export class EditWorkspaceGroupComponent {
  editWorkspaceGroupForm: FormGroup;

  constructor(private fb: FormBuilder,
              @Inject(MAT_DIALOG_DATA) public data: any) {
    this.editWorkspaceGroupForm = this.fb.group({
      name: this.fb.control(this.data.name, [Validators.required, Validators.minLength(3)])
    });
  }
}
