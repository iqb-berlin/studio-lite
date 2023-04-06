import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  Component, ElementRef, Inject, ViewChild
} from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { WorkspaceService } from '../services/workspace.service';

export interface NewUnitData {
  title: string,
  subTitle: string,
  key: string,
  label: string,
  groups: string[]
}

@Component({
  template: `
    <div fxLayout="column" style="height: 100%">
      <h1 mat-dialog-title>{{data.title}}</h1>
      <p *ngIf="data.subTitle">{{data.subTitle}}</p>
      <mat-dialog-content>
        <form [formGroup]="newUnitForm" fxLayout="column">
          <mat-form-field>
            <input matInput formControlName="key" placeholder="Kurzname" [value]="data.key" >
            <mat-error *ngIf="newUnitForm.get('key')?.invalid">
              Zu kurz, ungültige Zeichen oder schon vorhanden
            </mat-error>
          </mat-form-field>
          <mat-form-field>
            <input matInput formControlName="label" placeholder="Name" [value]="data.label">
          </mat-form-field>
          <div fxLayout="row" fxLayoutAlign="space-around center" fxLayoutGap="10px" *ngIf="!groupDirectMode">
            <mat-form-field fxFlex>
              <mat-select placeholder="Gruppe" formControlName="groupSelect">
                <mat-option *ngFor="let g of data.groups" [value]="g">
                  {{g}}
                </mat-option>
              </mat-select>
            </mat-form-field>
            <button mat-icon-button (click)="setGroupDirectMode(true)" matTooltip="Neue Gruppe anlegen">
              <mat-icon>add_circle</mat-icon>
            </button>
          </div>
          <div fxLayout="row" fxLayoutAlign="space-around center" fxLayoutGap="10px" *ngIf="groupDirectMode">
            <mat-form-field fxFlex>
              <input matInput #newGroupInput formControlName="groupDirect" placeholder="Gruppe (neu)">
            </mat-form-field>
            <button mat-icon-button *ngIf="data.groups.length > 0"
                    (click)="setGroupDirectMode(false)" matTooltip="Abbrechen - zurück zur Auswahl">
              <mat-icon>cancel</mat-icon>
            </button>
          </div>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions>
        <button mat-raised-button color="primary" type="submit"
                [mat-dialog-close]="newUnitForm" [disabled]="newUnitForm.invalid">Speichern</button>
        <button mat-raised-button [mat-dialog-close]="false">Abbrechen</button>
      </mat-dialog-actions>
    </div>
  `
})
export class NewUnitComponent {
  newUnitForm: UntypedFormGroup;
  groupDirectMode = false;
  @ViewChild('newGroupInput') newGroupInput: ElementRef | undefined;

  constructor(private fb: UntypedFormBuilder,
              public ds: WorkspaceService,
              @Inject(MAT_DIALOG_DATA) public data: NewUnitData) {
    this.newUnitForm = this.fb.group({
      key: this.fb.control(data.key, [Validators.required, Validators.pattern('[a-zA-Z-0-9_]+'),
        Validators.minLength(3),
        WorkspaceService.unitKeyUniquenessValidator(0, this.ds.unitList)]),
      label: this.fb.control(data.label),
      groupSelect: this.fb.control(''),
      groupDirect: this.fb.control('')
    });
    this.groupDirectMode = this.data.groups.length === 0;
  }

  setGroupDirectMode(b: boolean) {
    this.groupDirectMode = b;
    setTimeout(() => {
      if (b && this.newGroupInput) {
        this.newGroupInput.nativeElement.focus();
      }
    }, 100);
  }
}
