import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { WorkspaceGroupFullDto, WorkspaceInListDto } from '@studio-lite-lib/api-dto';

export interface MoveComponentData {
  title: string,
  content: string,
  default: string,
  okButtonLabel: string,
  data: WorkspaceGroupFullDto[],
  selectedRows: WorkspaceInListDto[]
}
@Component({
  templateUrl: './move-workspace.component.html',
  styleUrls: ['./move-workspace.component.scss']
})

export class MoveWorkspaceComponent {
  typedData: MoveComponentData;
  selectedValue:string = '';
  constructor(@Inject(MAT_DIALOG_DATA) data: unknown) {
    this.typedData = data as MoveComponentData;
  }
}
