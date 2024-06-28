import { UserInListDto, UserWorkspaceAccessDto, WorkspaceUserInListDto } from '@studio-lite-lib/api-dto';
import { WorkspaceUserChecked } from './workspace-user-checked.class';

export class WorkspaceUserToCheckCollection {
  entries: WorkspaceUserChecked[];
  private workspacesUsersIds: UserWorkspaceAccessDto[] = [];
  hasChanged = false;

  constructor(users: UserInListDto[] | WorkspaceUserInListDto[]) {
    this.entries = [];
    users.forEach(user => {
      this.entries.push(new WorkspaceUserChecked(user));
    });
  }

  setChecks(workspaceUsers?: WorkspaceUserInListDto[]): void {
    this.workspacesUsersIds = [];
    if (workspaceUsers) {
      workspaceUsers.forEach(u => this.workspacesUsersIds.push(
        {
          id: u.id,
          writeAccessLevel: u.workspaceWriteAccessLevel
        }));
    }
    this.entries.forEach(user => {
      const workspaceUser = this.workspacesUsersIds
        .find(workspacesUsersId => user.id === workspacesUsersId.id);
      if (workspaceUser) {
        user.isChecked = true;
        user.writeAccessLevel = workspaceUser.writeAccessLevel;
      } else {
        user.isChecked = false;
        user.writeAccessLevel = 0;
      }
    });
    this.hasChanged = false;
  }

  getChecks(): UserWorkspaceAccessDto[] {
    const checkedUserIds: UserWorkspaceAccessDto[] = [];
    this.entries.forEach(user => {
      if (user.isChecked) {
        checkedUserIds.push(
          {
            id: user.id,
            writeAccessLevel: user.writeAccessLevel
          });
      }
    });
    return checkedUserIds;
  }

  updateHasChanged(): void {
    this.hasChanged = false;
    this.entries.forEach(user => {
      const workspaceUser = this.workspacesUsersIds
        .find(workspacesUsersId => user.id === workspacesUsersId.id);
      if ((user.isChecked && !workspaceUser) || (!user.isChecked && workspaceUser)) {
        this.hasChanged = true;
      }
      if (workspaceUser && user.writeAccessLevel !== workspaceUser.writeAccessLevel) {
        this.hasChanged = true;
      }
    });
  }

  setHasChangedFalse(): void {
    this.workspacesUsersIds = [];
    this.entries.forEach(user => {
      if (user.isChecked) {
        this.workspacesUsersIds.push({
          id: user.id,
          writeAccessLevel: user.writeAccessLevel
        });
      }
    });
    this.hasChanged = false;
  }
}
