import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { UsersInWorkspaceDto } from '@studio-lite-lib/api-dto';

export interface WorkspaceUserListData {
  title: string,
  users: UsersInWorkspaceDto
}

@Component({
  selector: 'studio-lite-workspace-user-list',
  templateUrl: './workspace-user-list.component.html',
  styleUrls: ['./workspace-user-list.component.scss']
})
export class WorkspaceUserListComponent {
  title: string;
  userList: UsersInWorkspaceDto;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: unknown
  ) {
    this.title = (data as WorkspaceUserListData).title;
    this.userList = (data as WorkspaceUserListData).users;
  }
}
