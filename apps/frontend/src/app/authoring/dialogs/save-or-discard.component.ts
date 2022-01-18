import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  template: `
<h1 mat-dialog-title>{{ confirmData.title }}</h1>
<mat-dialog-content>
  <p>
    {{ confirmData.content }}
  </p>
</mat-dialog-content>
<mat-dialog-actions>
    <button mat-raised-button color="primary" [mat-dialog-close]="confirmData.confirmButtonReturn">
    {{ confirmData.confirmButtonLabel }}
    </button>
  <button mat-raised-button [mat-dialog-close]="confirmData.confirmButton2Return"
    *ngIf="confirmData.confirmButton2Label !== undefined">{{ confirmData.confirmButton2Label }}</button>
  <button mat-raised-button [mat-dialog-close]="false">Abbrechen</button>
</mat-dialog-actions>`
})
export class SaveOrDiscardComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public confirmData: ConfirmDialogData
  ) { }

  ngOnInit(): void {
    if ((typeof this.confirmData.title === 'undefined') || (this.confirmData.title.length === 0)) {
      this.confirmData.title = 'Bitte bestätigen!';
    }
    if ((typeof this.confirmData.confirmButtonReturn === 'undefined') || (this.confirmData.title.length === 0)) {
      this.confirmData.confirmButtonReturn = true;
    }
    if ((typeof this.confirmData.confirmButtonLabel === undefined) ||
      (this.confirmData.confirmButtonLabel.length === 0)) {
      this.confirmData.confirmButtonLabel = 'Bestätigen';
    }
  }
}

export interface ConfirmDialogData {
  title: string;
  content: string;
  confirmButtonLabel: string;
  confirmButtonReturn: any;
  confirmButton2Label: string;
  confirmButton2Return: any;
}
