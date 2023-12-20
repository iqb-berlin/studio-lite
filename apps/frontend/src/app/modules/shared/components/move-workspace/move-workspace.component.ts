import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { WorkspaceGroupFullDto, WorkspaceInListDto } from '@studio-lite-lib/api-dto';
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
  styleUrls: ['./move-workspace.component.scss']
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
