import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  template: `
      <h1 mat-dialog-title>{{title}}</h1>

      <mat-dialog-content fxLayout="column">
        <form [formGroup]="editUserForm" fxLayout="column">
          <p>
            Der Name muss mindestens drei Zeichen lang sein. Es sind nur Kleinbuchstaben und Ziffern erlaubt.
          </p>
        <mat-form-field>
          <input matInput formControlName="name" type="text" placeholder="Name" [value]="data.name"/>
        </mat-form-field>
        <mat-form-field>
          <mat-label>Notiz</mat-label>
          <input matInput formControlName="description" type="text" placeholder="Notiz" [value]="data.description"/>
        </mat-form-field>
        <mat-checkbox formControlName="isAdmin" [value]="data.isAdmin">System-Administrator:in</mat-checkbox>
        <p>&nbsp;</p>
        <p>
          Das Kennwort muss mindestens drei Zeichen lang sein und darf keine Leerzeichen enthalten.
        </p>
        <mat-form-field>
          <input matInput formControlName="password" type="password" [placeholder]="passwordLabel"/>
        </mat-form-field>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions>
        <button mat-raised-button color="primary"
                type="submit" [mat-dialog-close]="editUserForm"
                [disabled]="editUserForm.invalid">{{saveButtonLabel}}
        </button>
        <button mat-raised-button [mat-dialog-close]="false">Abbrechen</button>
      </mat-dialog-actions>
  `
})
export class EditUserComponent {
  editUserForm: FormGroup;
  saveButtonLabel: string;
  title: string;
  passwordLabel: string;

  constructor(private fb: FormBuilder,
              @Inject(MAT_DIALOG_DATA) public data: any) {
    this.saveButtonLabel = data.newUser ? 'Neu anlegen' : 'Speichern';
    this.title = data.newUser ? 'Nutzer:in neu anlegen' : 'Nutzerdaten ändern';
    this.passwordLabel = data.newUser ? 'Kennwort' : 'Neues Kennwort';
    this.editUserForm = this.fb.group({
      name: this.fb.control(this.data.name,
        [Validators.required, Validators.pattern(/^[a-zäöüß]{3,}$/)]),
      description: this.fb.control(this.data.description),
      isAdmin: this.fb.control(this.data.isAdmin),
      password: this.fb.control(this.data.password,
        data.newUser ?
          [Validators.pattern(/^\S{3,}$/), Validators.required] :
          [Validators.pattern(/^\S{3,}$/)])
    });
  }
}
