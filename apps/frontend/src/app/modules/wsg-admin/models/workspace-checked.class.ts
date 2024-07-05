import { WorkspaceDto } from '@studio-lite-lib/api-dto';

export class WorkspaceChecked {
  id: number;
  name: string;
  isChecked: boolean;
  accessLevel: number;

  constructor(workspaceDto: WorkspaceDto) {
    this.id = workspaceDto.id;
    this.name = workspaceDto.name;
    this.isChecked = false;
    this.accessLevel = 0;
  }
}
