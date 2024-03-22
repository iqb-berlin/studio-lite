import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { ConfirmDialogData } from '../../models/confirm-dialog.interface';
import { WorkspaceService } from '../../services/workspace.service';
import { TranslateModule } from '@ngx-translate/core';
import { NgIf } from '@angular/common';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'studio-lite-save-or-discard',
    templateUrl: './save-or-discard.component.html',
    styleUrls: ['./save-or-discard.component.scss'],
    standalone: true,
    imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatButton, MatDialogClose, NgIf, TranslateModule]
})
export class SaveOrDiscardComponent {
  constructor(public workspaceService: WorkspaceService,
              @Inject(MAT_DIALOG_DATA) public confirmData: ConfirmDialogData
  ) {}
}
