import {WorkspaceDto, WorkspaceGroupDto, WorkspaceInListDto} from "@studio-lite-lib/api-dto";
import {WorkspaceData} from "../../authoring/backend.service";

export class WorkspaceChecked {
  public id: number;
  public name: string;
  public isChecked: boolean;
  constructor(workspaceDto: WorkspaceDto ) {
    this.id = workspaceDto.id;
    this.name = workspaceDto.name;
    this.isChecked = false;
  }
}

export class WorkspaceGroupToCheck {
  public id: number;
  public name: string;
  public workspaces: WorkspaceChecked[];
  constructor(workspaceGroupDto: WorkspaceGroupDto ) {
    this.id = workspaceGroupDto.id;
    this.name = workspaceGroupDto.name;
    this.workspaces = [];
    workspaceGroupDto.workspaces.forEach(workspace => {
      this.workspaces.push(new WorkspaceChecked(workspace))
    })
  }
}

export class WorkspaceGroupToCheckCollection {
  public entries: WorkspaceGroupToCheck[]
  private userWorkspacesIds: number[] = [];
  public hasChanged = false;

  constructor(workspaceGroups: WorkspaceGroupDto[] ) {
    this.entries = [];
    workspaceGroups.forEach(workspaceGroup => {
      if (workspaceGroup.workspaces.length > 0) this.entries.push(new WorkspaceGroupToCheck(workspaceGroup))
    })
  }

  setChecks(userWorkspaces?: WorkspaceInListDto[]): void {
    this.userWorkspacesIds = [];
    if (userWorkspaces) userWorkspaces.forEach(ws => this.userWorkspacesIds.push(ws.id));
    this.entries.forEach(workspaceGroup => {
      workspaceGroup.workspaces.forEach(workspace => {
        workspace.isChecked = this.userWorkspacesIds.indexOf(workspace.id) > -1;
      })
    });
    this.hasChanged = false;
  }

  getChecks(): number[] {
    const checkedWorkspacesIds: number[] = [];
    this.entries.forEach(workspaceGroup => {
      workspaceGroup.workspaces.forEach(workspace => {
        if (workspace.isChecked) checkedWorkspacesIds.push(workspace.id);
      })
    });
    return checkedWorkspacesIds;
  }

  updateHasChanged(): void {
    this.hasChanged = false;
    this.entries.forEach(workspaceGroup => {
      workspaceGroup.workspaces.forEach(workspace => {
        if ((workspace.isChecked && this.userWorkspacesIds.indexOf(workspace.id) < 0) ||
          (!workspace.isChecked && this.userWorkspacesIds.indexOf(workspace.id) > -1)) {
          this.hasChanged = true;
          return
        }
      })
    });
  }

  setHasChangedFalse(): void {
    this.userWorkspacesIds = [];
    this.entries.forEach(workspaceGroup => {
      workspaceGroup.workspaces.forEach(workspace => {
        if (workspace.isChecked) this.userWorkspacesIds.push(workspace.id);
      })
    });
    this.hasChanged = false;
  }
}

export interface WorkspaceGroupData {
  id: number;
  name: string;
  workspaceCount: number;
}
