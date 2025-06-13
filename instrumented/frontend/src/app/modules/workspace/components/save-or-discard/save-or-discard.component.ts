import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose
} from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';

import { MatButton } from '@angular/material/button';
import { WorkspaceService } from '../../services/workspace.service';
import { ConfirmDialogData } from '../../models/confirm-dialog.interface';

@Component({
  selector: 'studio-lite-save-or-discard',
  templateUrl: './save-or-discard.component.html',
  styleUrls: ['./save-or-discard.component.scss'],
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatButton, MatDialogClose, TranslateModule]
})
export class SaveOrDiscardComponent {
  constructor(public workspaceService: WorkspaceService,
              @Inject(MAT_DIALOG_DATA) public confirmData: ConfirmDialogData
  ) {}
}
