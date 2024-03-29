import { UserInListDto } from '@studio-lite-lib/api-dto';
import { UserChecked } from './users-checked.class';

export class UserToCheckCollection {
  entries: UserChecked[];
  private workspacesUsersIds: number[] = [];
  hasChanged = false;

  constructor(users: UserInListDto[]) {
    this.entries = [];
    users.forEach(user => {
      this.entries.push(new UserChecked(user));
    });
  }

  setChecks(workspaceUsers?: UserInListDto[]): void {
    this.workspacesUsersIds = [];
    if (workspaceUsers) workspaceUsers.forEach(u => this.workspacesUsersIds.push(u.id));
    this.entries.forEach(user => {
      user.isChecked = this.workspacesUsersIds.indexOf(user.id) > -1;
    });
    this.hasChanged = false;
  }

  getChecks(): number[] {
    const checkedUserIds: number[] = [];
    this.entries.forEach(user => {
      if (user.isChecked) checkedUserIds.push(user.id);
    });
    return checkedUserIds;
  }

  updateHasChanged(): void {
    this.hasChanged = false;
    this.entries.forEach(user => {
      if ((user.isChecked && this.workspacesUsersIds.indexOf(user.id) < 0) ||
        (!user.isChecked && this.workspacesUsersIds.indexOf(user.id) > -1)) {
        this.hasChanged = true;
      }
    });
  }

  setHasChangedFalse(): void {
    this.workspacesUsersIds = [];
    this.entries.forEach(user => {
      if (user.isChecked) this.workspacesUsersIds.push(user.id);
    });
    this.hasChanged = false;
  }
}
