import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose
} from '@angular/material/dialog';
import { WorkspaceGroupFullDto, WorkspaceInListDto } from '@studio-lite-lib/api-dto';
import { TranslateModule } from '@ngx-translate/core';
import { MatButton } from '@angular/material/button';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WsgAdminService } from '../../../wsg-admin/services/wsg-admin.service';

export interface MoveComponentData {
  title: string,
  warning:string,
  content: string,
  default: string,
  okButtonLabel: string,
  workspaceGroups: WorkspaceGroupFullDto[],
  selectedRows: WorkspaceInListDto[]
}
@Component({
    templateUrl: './move-workspace.component.html',
    styleUrls: ['./move-workspace.component.scss'],
    // eslint-disable-next-line max-len
    imports: [MatDialogTitle, MatDialogContent, FormsModule, MatFormField, MatLabel, MatSelect, MatOption, MatDialogActions, NgClass, MatButton, MatDialogClose, TranslateModule]
})

export class MoveWorkspaceComponent {
  typedData: MoveComponentData;
  selectedValue:string = '';
  constructor(@Inject(MAT_DIALOG_DATA) data: unknown, private wsg_admin_service:WsgAdminService) {
    this.typedData = data as MoveComponentData;
    this.typedData.workspaceGroups = this.typedData.workspaceGroups && this.typedData.workspaceGroups
      .filter(wsg => wsg.id !== wsg_admin_service.selectedWorkspaceGroupId);
  }
}
