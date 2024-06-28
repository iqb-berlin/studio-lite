import { WorkspaceDto } from '@studio-lite-lib/api-dto';

export class WorkspaceChecked {
  id: number;
  name: string;
  isChecked: boolean;
  writeAccessLevel: number;

  constructor(workspaceDto: WorkspaceDto) {
    this.id = workspaceDto.id;
    this.name = workspaceDto.name;
    this.isChecked = false;
    this.writeAccessLevel = 0;
  }
}
