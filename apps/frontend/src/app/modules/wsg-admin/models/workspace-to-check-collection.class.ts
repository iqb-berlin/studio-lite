import { UsersWorkspaceInListDto, UserWorkspaceAccessDto } from '@studio-lite-lib/api-dto';
import { WorkspaceChecked } from './workspace-checked.class';

export class WorkspaceToCheckCollection {
  entries: WorkspaceChecked[];
  private userWorkspacesIds: UserWorkspaceAccessDto[] = [];
  hasChanged = false;

  constructor(workspaces: UsersWorkspaceInListDto[]) {
    this.entries = [];
    workspaces.forEach(workspace => {
      this.entries.push(new WorkspaceChecked(workspace));
    });
  }

  setChecks(userWorkspaces?: UsersWorkspaceInListDto[]): void {
    this.userWorkspacesIds = [];
    if (userWorkspaces) {
      userWorkspaces.forEach(ws => this.userWorkspacesIds.push(
        {
          id: ws.id,
          accessLevel: ws.userAccessLevel
        }));
    }
    this.entries.forEach(workspace => {
      const userWorkspace = this.userWorkspacesIds
        .find(userWorkspaceId => workspace.id === userWorkspaceId.id);
      if (userWorkspace) {
        workspace.isChecked = true;
        workspace.accessLevel = userWorkspace.accessLevel;
      } else {
        workspace.isChecked = false;
        workspace.accessLevel = 0;
      }
    });
    this.hasChanged = false;
  }

  getChecks(): UserWorkspaceAccessDto[] {
    const checkedWorkspacesIds: UserWorkspaceAccessDto[] = [];
    this.entries.forEach(workspace => {
      if (workspace.isChecked) {
        checkedWorkspacesIds.push(
          {
            id: workspace.id,
            accessLevel: workspace.accessLevel
          });
      }
    });
    return checkedWorkspacesIds;
  }

  updateHasChanged(): void {
    this.hasChanged = false;
    this.entries.forEach(workspace => {
      const userWorkspace = this.userWorkspacesIds
        .find(userWorkspaceId => workspace.id === userWorkspaceId.id);

      if ((workspace.isChecked && !userWorkspace) || (!workspace.isChecked && userWorkspace)) {
        this.hasChanged = true;
      }
      if (userWorkspace && workspace.accessLevel !== userWorkspace.accessLevel) {
        this.hasChanged = true;
      }
    });
  }

  setHasChangedFalse(): void {
    this.userWorkspacesIds = [];
    this.entries.forEach(workspace => {
      if (workspace.isChecked) {
        this.userWorkspacesIds.push({
          id: workspace.id,
          accessLevel: workspace.accessLevel
        });
      }
    });
    this.hasChanged = false;
  }
}
