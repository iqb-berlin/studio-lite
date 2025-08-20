import { ApiProperty } from '@nestjs/swagger';
import { WorkspaceDto } from '../workspace/workspace-dto';

export class WorkspaceGroupDto {
  @ApiProperty()
    id!: number;

  @ApiProperty()
    name!: string;

  @ApiProperty()
    isAdmin!: boolean;

  @ApiProperty()
    workspaces!: WorkspaceDto[];
}
