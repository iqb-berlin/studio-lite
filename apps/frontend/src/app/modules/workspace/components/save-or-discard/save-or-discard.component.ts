import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfirmDialogData } from '../../models/confirm-dialog.data';

@Component({
  selector: 'studio-lite-save-or-discard',
  templateUrl: './save-or-discard.component.html',
  styleUrls: ['./save-or-discard.component.scss']
})
export class SaveOrDiscardComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public confirmData: ConfirmDialogData
  ) { }
}
