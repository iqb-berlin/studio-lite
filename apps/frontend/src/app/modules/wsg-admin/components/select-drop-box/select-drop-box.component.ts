import { Component, Inject } from '@angular/core';

import { MatButton } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle
} from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { WorkspaceInListDto } from '@studio-lite-lib/api-dto';
import { MatOption } from '@angular/material/autocomplete';
import { MatFormField, MatLabel, MatSelect } from '@angular/material/select';

@Component({
  selector: 'studio-lite-select-drop-box',
  // eslint-disable-next-line max-len
  imports: [MatButton, MatDialogActions, MatDialogContent, MatDialogTitle, TranslateModule, MatDialogClose, MatOption, MatSelect, MatLabel, MatFormField],
  templateUrl: './select-drop-box.component.html',
  styleUrl: './select-drop-box.component.scss'
})
export class SelectDropBoxComponent {
  workspaces: WorkspaceInListDto[];
  dropBoxId: number;
  selectedWorkspaceName: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {
      workspaces: WorkspaceInListDto[],
      dropBoxId: number,
      selectedWorkspaceName: string
    }) {
    this.workspaces = data.workspaces;
    this.dropBoxId = data.dropBoxId;
    this.selectedWorkspaceName = data.selectedWorkspaceName;
  }
}
