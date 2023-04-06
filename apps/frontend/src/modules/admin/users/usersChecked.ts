// eslint-disable-next-line max-classes-per-file
import { UserInListDto } from '@studio-lite-lib/api-dto';

export class UserChecked {
  id: number;
  name: string;
  displayName: string | undefined;
  description: string | undefined;
  isChecked: boolean;
  constructor(userDto: UserInListDto) {
    this.id = userDto.id;
    this.name = userDto.name;
    this.displayName = userDto.displayName;
    this.description = userDto.description;
    this.isChecked = false;
  }
}

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
