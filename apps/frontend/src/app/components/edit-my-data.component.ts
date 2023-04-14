import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MyData } from '../models/my-data';

@Component({
  template: `
      <h1 mat-dialog-title>Meine Daten ändern</h1>

      <mat-dialog-content class="fx-column-start-stretch">
        <form [formGroup]="editUserForm" class="fx-column-start-stretch">
          <mat-form-field>
            <input matInput formControlName="lastName" type="text" placeholder="Nachname" [value]="data.lastName"/>
          </mat-form-field>
          <mat-form-field>
            <input matInput formControlName="firstName" type="text" placeholder="Vorname" [value]="data.firstName"/>
          </mat-form-field>
          <mat-form-field>
            <input matInput formControlName="email" type="text" placeholder="E-Mail" [value]="data.email"/>
          </mat-form-field>
          <div class="fx-row-start-stretch" [style.column-gap.px]="10">
            <mat-checkbox formControlName="emailPublishApproval"
                          [value]="data.emailPublishApproved ? data.emailPublishApproved.toString() : 'false'">
            </mat-checkbox>
            <div>Ich stimme zu, dass die E-Mail-Adresse für andere in meinen Arbeitsbereichen sichtbar ist.</div>
          </div>
          <mat-form-field>
            <mat-label>Notiz</mat-label>
            <input matInput formControlName="description" type="text" placeholder="Notiz" [value]="data.description"/>
          </mat-form-field>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions>
        <button mat-raised-button color="primary"
                type="submit" [mat-dialog-close]="editUserForm"
                [disabled]="editUserForm.invalid">Speichern
        </button>
        <button mat-raised-button [mat-dialog-close]="false">Abbrechen</button>
      </mat-dialog-actions>
  `
})

export class EditMyDataComponent {
  editUserForm: UntypedFormGroup;

  constructor(private fb: UntypedFormBuilder,
              @Inject(MAT_DIALOG_DATA) public data: MyData) {
    this.editUserForm = this.fb.group({
      lastName: this.fb.control(this.data.lastName),
      firstName: this.fb.control(this.data.firstName),
      email: this.fb.control(this.data.email),
      emailPublishApproval: this.fb.control(this.data.emailPublishApproved),
      description: this.fb.control(this.data.description)
    });
  }
}
