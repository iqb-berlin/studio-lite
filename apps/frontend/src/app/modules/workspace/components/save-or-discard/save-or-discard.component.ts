import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfirmDialogData } from '../../models/confirm-dialog.interface';
import { WorkspaceService } from '../../services/workspace.service';

@Component({
  selector: 'studio-lite-save-or-discard',
  templateUrl: './save-or-discard.component.html',
  styleUrls: ['./save-or-discard.component.scss']
})
export class SaveOrDiscardComponent {
  constructor(public workspaceService: WorkspaceService,
              @Inject(MAT_DIALOG_DATA) public confirmData: ConfirmDialogData
  ) {}
}
