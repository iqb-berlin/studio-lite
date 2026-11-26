import {
  Component, computed, Inject, signal
} from '@angular/core';
import {
  MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle
} from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatButton } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { TargetWorkspace } from '../../utils/target-workspaces.utils';

export interface SelectTargetWorkspaceData {
  title: string;
  confirmLabel: string;
  workspaces: TargetWorkspace[];
  /** Whether the comments may be taken along: when copying. */
  commentsOption: boolean;
  /** What the user should know before confirming, already translated. */
  hints: string[];
}

export interface SelectTargetWorkspaceResult {
  targetWorkspaceId: number;
  copyComments: boolean;
}

/**
 * Asks where one unit is to be copied or moved, and is the confirmation of it: unlike the dialog for
 * many units, it lists no units to pick from (#2232). Only its confirming button returns a result.
 */
@Component({
  selector: 'studio-lite-select-target-workspace',
  templateUrl: './select-target-workspace.component.html',
  styleUrls: ['./select-target-workspace.component.scss'],
  imports: [
    MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatFormField, MatLabel, MatSelect, MatOption,
    MatCheckbox, MatButton, TranslateModule
  ]
})
export class SelectTargetWorkspaceComponent {
  readonly targetWorkspaceId = signal(0);
  readonly copyComments = signal(true);
  readonly result = computed((): SelectTargetWorkspaceResult => ({
    targetWorkspaceId: this.targetWorkspaceId(),
    copyComments: this.data.commentsOption && this.copyComments()
  }));

  constructor(@Inject(MAT_DIALOG_DATA) public data: SelectTargetWorkspaceData) {}
}
