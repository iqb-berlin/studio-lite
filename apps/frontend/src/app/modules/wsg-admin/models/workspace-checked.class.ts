import { WorkspaceDto } from '@studio-lite-lib/api-dto';

export class WorkspaceChecked {
  id: number;
  name: string;
  isChecked: boolean;
  hasWriteAccess: boolean;

  constructor(workspaceDto: WorkspaceDto) {
    this.id = workspaceDto.id;
    this.name = workspaceDto.name;
    this.isChecked = false;
    this.hasWriteAccess = false;
  }
}
