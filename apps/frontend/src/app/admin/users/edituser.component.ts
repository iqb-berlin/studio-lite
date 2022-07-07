import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';

export type EditUserComponentData = {
  newUser: boolean,
  name?: string,
  password?: string,
  description?: string,
  firstName?: string,
  lastName?: string,
  email?: string,
  isAdmin: boolean,
  emailApproved: boolean
};

@Component({
  template: `
      <h1 mat-dialog-title>{{title}}</h1>

      <mat-dialog-content fxLayout="column">
        <form [formGroup]="editUserForm" fxLayout="column">
          <p>
            Der Name muss mindestens drei Zeichen lang sein. Es sind nur Kleinbuchstaben und Ziffern erlaubt.
          </p>
          <mat-form-field>
            <input matInput formControlName="name" type="text" placeholder="Login-Name" [value]="data.name"/>
          </mat-form-field>
          <mat-form-field>
            <input matInput formControlName="lastName" type="text" placeholder="Nachname" [value]="data.lastName"/>
          </mat-form-field>
          <mat-form-field>
            <input matInput formControlName="firstName" type="text" placeholder="Vorname" [value]="data.firstName"/>
          </mat-form-field>
          <mat-form-field>
            <input matInput formControlName="email" type="text" placeholder="E-Mail" [value]="data.email"/>
          </mat-form-field>
          <div *ngIf="data.emailApproved" class="email-consent"
               fxLayout="row" fxLayoutAlign="start center">
            <mat-icon>check_circle_outline</mat-icon>
            Zustimmung zur Anzeige der E-Mail-Adresse wurde erteilt.</div>
          <div *ngIf="!data.emailApproved" class="email-consent"
               fxLayout="row" fxLayoutAlign="start center">
            <mat-icon>highlight_off</mat-icon>
            Zustimmung zur Anzeige der E-Mail-Adresse wurde nicht erteilt.</div>
          <mat-form-field>
            <mat-label>Notiz</mat-label>
            <input matInput formControlName="description" type="text" placeholder="Notiz" [value]="data.description"/>
          </mat-form-field>
          <mat-checkbox formControlName="isAdmin" [value]="data.isAdmin.toString()">
            System-Administrator:in
          </mat-checkbox>
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
  `,
  styles: [
    '.email-consent {margin-bottom: 10px}',
    '.email-consent mat-icon {margin-right: 10px}'
  ]
})

export class EditUserComponent {
  editUserForm: UntypedFormGroup;
  saveButtonLabel: string;
  title: string;
  passwordLabel: string;

  constructor(private fb: UntypedFormBuilder,
              @Inject(MAT_DIALOG_DATA) public data: EditUserComponentData) {
    this.saveButtonLabel = data.newUser ? 'Neu anlegen' : 'Speichern';
    this.title = data.newUser ? 'Nutzer:in neu anlegen' : 'Nutzerdaten ändern';
    this.passwordLabel = data.newUser ? 'Kennwort' : 'Neues Kennwort';
    this.editUserForm = this.fb.group({
      name: this.fb.control(this.data.name,
        [Validators.required, Validators.pattern(/^[a-zäöüß]{3,}$/)]),
      lastName: this.fb.control(this.data.lastName),
      firstName: this.fb.control(this.data.firstName),
      email: this.fb.control(this.data.email),
      description: this.fb.control(this.data.description),
      isAdmin: this.fb.control(this.data.isAdmin),
      password: this.fb.control(this.data.password,
        data.newUser ?
          [Validators.pattern(/^\S{3,}$/), Validators.required] :
          [Validators.pattern(/^\S{3,}$/)])
    });
  }
}
