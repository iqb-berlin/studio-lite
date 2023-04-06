// eslint-disable-next-line max-classes-per-file
import { WorkspaceDto, WorkspaceInListDto } from '@studio-lite-lib/api-dto';

export class WorkspaceChecked {
  id: number;
  name: string;
  isChecked: boolean;
  constructor(workspaceDto: WorkspaceDto) {
    this.id = workspaceDto.id;
    this.name = workspaceDto.name;
    this.isChecked = false;
  }
}

export class WorkspaceToCheckCollection {
  entries: WorkspaceChecked[];
  private userWorkspacesIds: number[] = [];
  hasChanged = false;

  constructor(workspaces: WorkspaceInListDto[]) {
    this.entries = [];
    workspaces.forEach(workspace => {
      this.entries.push(new WorkspaceChecked(workspace));
    });
  }

  setChecks(userWorkspaces?: WorkspaceInListDto[]): void {
    this.userWorkspacesIds = [];
    if (userWorkspaces) userWorkspaces.forEach(ws => this.userWorkspacesIds.push(ws.id));
    this.entries.forEach(workspace => {
      workspace.isChecked = this.userWorkspacesIds.indexOf(workspace.id) > -1;
    });
    this.hasChanged = false;
  }

  getChecks(): number[] {
    const checkedWorkspacesIds: number[] = [];
    this.entries.forEach(workspace => {
      if (workspace.isChecked) checkedWorkspacesIds.push(workspace.id);
    });
    return checkedWorkspacesIds;
  }

  updateHasChanged(): void {
    this.hasChanged = false;
    this.entries.forEach(workspace => {
      if ((workspace.isChecked && this.userWorkspacesIds.indexOf(workspace.id) < 0) ||
        (!workspace.isChecked && this.userWorkspacesIds.indexOf(workspace.id) > -1)) {
        this.hasChanged = true;
      }
    });
  }

  setHasChangedFalse(): void {
    this.userWorkspacesIds = [];
    this.entries.forEach(workspace => {
      if (workspace.isChecked) this.userWorkspacesIds.push(workspace.id);
    });
    this.hasChanged = false;
  }
}
