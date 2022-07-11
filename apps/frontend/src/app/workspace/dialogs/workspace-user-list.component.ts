import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { UsersInWorkspaceDto } from '@studio-lite-lib/api-dto';

export interface WorkspaceUserListData {
  title: string,
  users: UsersInWorkspaceDto
}

@Component({
  template: `
    <div fxLayout="column" style="height: 100%">
      <h1 mat-dialog-title>{{title}}</h1>
      <mat-dialog-content fxLayout="column">
        <div *ngIf="userList.users.length > 0" fxLayout="column">
          <user-list [users]="userList.users" class="gray-back"></user-list>
        </div>
        <div *ngIf="userList.users.length === 0" fxLayout="column" class="data-text">
          Es sind keine Nutzer:innen mit regulären Lese- und Schreibrechten zugewiesen.
        </div>
        <div *ngIf="userList.workspaceGroupAdmins.length > 0" fxLayout="column">
          <div class="data-text">Die folgenden Nutzer:innen verfügen über besondere Rechte, um
            Einstellungen des Arbeitsbereiches zu ändern oder anderen Zugriffsrechte zu gewähren:</div>
          <user-list [users]="userList.workspaceGroupAdmins"></user-list>
        </div>
        <div *ngIf="userList.admins.length > 0" fxLayout="column">
          <div class="data-text">Die folgenden Nutzer:innen betreuen die allgemeinen
            Servereinstellungen und können bei besonderen Problemen helfen:</div>
          <user-list [users]="userList.admins"></user-list>
        </div>
      </mat-dialog-content>
      <mat-dialog-actions>
        <button mat-raised-button [mat-dialog-close]="false">Schließen</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: ['.data-text {margin-top: 20px}']
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
