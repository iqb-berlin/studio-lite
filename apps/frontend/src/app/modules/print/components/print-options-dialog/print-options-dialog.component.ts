import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'studio-lite-print-options-dialog',
  templateUrl: './print-options-dialog.component.html',
  styleUrls: ['./print-options-dialog.component.scss']
})
export class PrintOptionsDialogComponent {
  constructor(public dialogRef: MatDialogRef<PrintOptionsDialogComponent>) {
  }

  cancel() {
    this.dialogRef.close();
  }
}
