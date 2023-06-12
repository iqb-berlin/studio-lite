import { WorkspaceGroupInListDto } from '@studio-lite-lib/api-dto';

export class WorkspaceGroupToCheck {
  id: number;
  name: string;
  isChecked: boolean;
  constructor(workspaceGroup: WorkspaceGroupInListDto) {
    this.id = workspaceGroup.id;
    this.name = workspaceGroup.name;
    this.isChecked = false;
  }
}
