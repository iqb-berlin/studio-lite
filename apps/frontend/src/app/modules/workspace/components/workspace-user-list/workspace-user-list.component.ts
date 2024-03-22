import { MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { UsersInWorkspaceDto } from '@studio-lite-lib/api-dto';
import { TranslateModule } from '@ngx-translate/core';
import { MatButton } from '@angular/material/button';
import { UserListComponent } from '../user-list/user-list.component';
import { NgIf } from '@angular/common';

export interface WorkspaceUserListData {
  title: string,
  users: UsersInWorkspaceDto
}

@Component({
    selector: 'studio-lite-workspace-user-list',
    templateUrl: './workspace-user-list.component.html',
    styleUrls: ['./workspace-user-list.component.scss'],
    standalone: true,
    imports: [MatDialogTitle, MatDialogContent, NgIf, UserListComponent, MatDialogActions, MatButton, MatDialogClose, TranslateModule]
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
