import { ApiProperty } from '@nestjs/swagger';

export class AuthDataDto {
  @ApiProperty()
  userId!: number;

  @ApiProperty()
  userName!: string;

  @ApiProperty()
  isAdmin!: boolean;

  @ApiProperty()
  workspaces!: WorkspaceGroupDto[];
}

export class WorkspaceGroupDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  workspaces!: WorkspaceDto[];
}

export class WorkspaceDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  name!: string;
}
