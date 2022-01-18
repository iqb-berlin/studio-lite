import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'tc-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css']
})
export class ConfirmDialogComponent implements OnInit {
  public showcancel = true;

  constructor(@Inject(MAT_DIALOG_DATA) public confirmdata: ConfirmDialogData) {}

  ngOnInit(): void {
    if ((typeof this.confirmdata.title === 'undefined') || (this.confirmdata.title.length === 0)) {
      this.confirmdata.title = 'Bitte bestätigen!';
    }
    if ((typeof this.confirmdata.confirmbuttonlabel === 'undefined') || (this.confirmdata.confirmbuttonlabel.length === 0)) {
      this.confirmdata.confirmbuttonlabel = 'Bestätigen';
    }
    if (!this.confirmdata.showcancel) {
      this.showcancel = false;
    }
  }
}

export interface ConfirmDialogData {
  title: string;
  content: string;
  confirmbuttonlabel: string;
  showcancel: boolean;
}
