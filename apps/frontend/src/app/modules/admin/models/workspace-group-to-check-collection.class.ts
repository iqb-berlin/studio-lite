import { WorkspaceGroupInListDto } from '@studio-lite-lib/api-dto';
import { WorkspaceGroupToCheck } from './workspace-group-to-check.class';

export class WorkspaceGroupToCheckCollection {
  entries: WorkspaceGroupToCheck[];
  hasChanged = false;
  private userWorkspacesIds: number[] = [];

  constructor(workspaceGroups: WorkspaceGroupInListDto[]) {
    this.entries = workspaceGroups.map(wsg => new WorkspaceGroupToCheck(wsg));
  }

  setChecks(workspaceGroups?: WorkspaceGroupInListDto[]): void {
    this.userWorkspacesIds = [];
    if (workspaceGroups) this.userWorkspacesIds = workspaceGroups.map(wsg => wsg.id);
    this.entries.forEach(workspaceGroup => {
      workspaceGroup.isChecked = this.userWorkspacesIds.indexOf(workspaceGroup.id) > -1;
    });
    this.hasChanged = false;
  }

  getChecks(): number[] {
    const checkedWorkspacesIds: number[] = [];
    this.entries.forEach(workspaceGroup => {
      if (workspaceGroup.isChecked) checkedWorkspacesIds.push(workspaceGroup.id);
    });
    return checkedWorkspacesIds;
  }

  updateHasChanged(): void {
    this.hasChanged = false;
    this.entries.forEach(workspaceGroup => {
      if ((workspaceGroup.isChecked && this.userWorkspacesIds.indexOf(workspaceGroup.id) < 0) ||
        (!workspaceGroup.isChecked && this.userWorkspacesIds.indexOf(workspaceGroup.id) > -1)) {
        this.hasChanged = true;
      }
    });
  }

  setHasChangedFalse(): void {
    this.userWorkspacesIds = [];
    this.entries.forEach(workspaceGroup => {
      if (workspaceGroup.isChecked) this.userWorkspacesIds.push(workspaceGroup.id);
    });
    this.hasChanged = false;
  }
}
