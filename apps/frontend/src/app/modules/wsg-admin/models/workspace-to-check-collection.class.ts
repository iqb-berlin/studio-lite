import {
  UsersWorkspaceInListDto,
  UserWorkspaceAccessDto
} from '@studio-lite-lib/api-dto';
import { WorkspaceChecked } from './workspace-checked.class';
import { CheckCollection } from '../../../models/check-collection.class';

export class WorkspaceToCheckCollection extends CheckCollection<WorkspaceChecked> {
  entries: WorkspaceChecked[];
  private userWorkspacesIds: UserWorkspaceAccessDto[] = [];
  hasChanged = false;

  constructor(workspaces: UsersWorkspaceInListDto[]) {
    super();
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
    this.sortEntries();
    this.hasChanged = false;
  }

  getChecks(): UserWorkspaceAccessDto[] {
    return this.entries
      .filter(workspace => workspace.isChecked)
      .map(workspace => ({ id: workspace.id, accessLevel: workspace.accessLevel }));
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
