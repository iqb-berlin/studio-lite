import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  template: `
      <h1 mat-dialog-title>{{data.title}}</h1>

      <mat-dialog-content fxLayout="column">
        <form [formGroup]="editUserForm" fxLayout="column">
        <mat-form-field>
          <input matInput formControlName="name" type="text" placeholder="Name" [value]="data.name"/>
        </mat-form-field>
        <mat-form-field>
          <mat-label>E-Mail</mat-label>
          <input matInput formControlName="email" type="email" placeholder="E-Mail" [value]="data.email"/>
        </mat-form-field>
        <mat-checkbox formControlName="isAdmin" [value]="data.isAdmin">System-Administrator</mat-checkbox>
        <p>&nbsp;</p>
        <p>
          Das Kennwort muss mindestens drei Zeichen lang sein und darf keine Leerzeichen enthalten.
        </p>
        <mat-form-field>
          <input matInput formControlName="password" type="password" placeholder="Neues Kennwort"/>
        </mat-form-field>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions>
        <button mat-raised-button color="primary"
                type="submit" [mat-dialog-close]="editUserForm"
                [disabled]="editUserForm.invalid">{{data.saveButtonLabel}}
        </button>
        <button mat-raised-button [mat-dialog-close]="false">Abbrechen</button>
      </mat-dialog-actions>
  `
})
export class EditUserComponent {
  editUserForm: FormGroup;

  constructor(private fb: FormBuilder,
              @Inject(MAT_DIALOG_DATA) public data: any) {
    this.editUserForm = this.fb.group({
      name: this.fb.control(this.data.name, [Validators.required, Validators.minLength(3)]),
      email: this.fb.control(this.data.email, [Validators.email]),
      isAdmin: this.fb.control(this.data.isAdmin),
      password: this.fb.control(this.data.password, [
        Validators.pattern(/^\S{3,}$/)])
    })
  }
}
