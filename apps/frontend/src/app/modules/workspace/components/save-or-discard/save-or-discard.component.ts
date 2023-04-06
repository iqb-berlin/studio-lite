import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'studio-lite-save-or-discard',
  templateUrl: './save-or-discard.component.html',
  styleUrls: ['./save-or-discard.component.scss']
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  confirmButtonReturn: any;
  confirmButton2Label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  confirmButton2Return: any;
}
