import { UserInListDto, UserWorkspaceAccessDto, WorkspaceUserInListDto } from '@studio-lite-lib/api-dto';
import { WorkspaceUserChecked } from './workspace-user-checked.class';
import { CheckCollection } from '../../shared/models/check-collection.class';

export class WorkspaceUserToCheckCollection extends CheckCollection<WorkspaceUserChecked> {
  entries: WorkspaceUserChecked[];
  private workspacesUsersIds: UserWorkspaceAccessDto[] = [];
  hasChanged = false;

  constructor(users: UserInListDto[] | WorkspaceUserInListDto[]) {
    super();
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
          accessLevel: u.workspaceAccessLevel
        }));
    }
    this.entries.forEach(user => {
      const workspaceUser = this.workspacesUsersIds
        .find(workspacesUsersId => user.id === workspacesUsersId.id);
      if (workspaceUser) {
        user.isChecked = true;
        user.accessLevel = workspaceUser.accessLevel;
      } else {
        user.isChecked = false;
        user.accessLevel = 0;
      }
    });
    this.sortEntries();
    this.hasChanged = false;
  }

  getChecks(): UserWorkspaceAccessDto[] {
    const checkedUserIds: UserWorkspaceAccessDto[] = [];
    this.entries.forEach(user => {
      if (user.isChecked) {
        checkedUserIds.push(
          {
            id: user.id,
            accessLevel: user.accessLevel
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
      if (workspaceUser && user.accessLevel !== workspaceUser.accessLevel) {
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
          accessLevel: user.accessLevel
        });
      }
    });
    this.hasChanged = false;
  }
}
