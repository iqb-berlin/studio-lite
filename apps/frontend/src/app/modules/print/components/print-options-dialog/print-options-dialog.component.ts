import { Component } from '@angular/core';
import {
  MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose
} from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MatButton } from '@angular/material/button';
import { PrintOptionsComponent } from '../../../shared/components/print-options/print-options.component';

@Component({
  selector: 'studio-lite-print-options-dialog',
  templateUrl: './print-options-dialog.component.html',
  styleUrls: ['./print-options-dialog.component.scss'],
  // eslint-disable-next-line max-len
  imports: [MatDialogTitle, MatDialogContent, PrintOptionsComponent, MatDialogActions, MatButton, MatDialogClose, TranslateModule]
})
export class PrintOptionsDialogComponent {
  constructor(public dialogRef: MatDialogRef<PrintOptionsDialogComponent>) {
  }

  cancel() {
    this.dialogRef.close();
  }
}
