// eslint-disable-next-line max-classes-per-file
import { ApiProperty } from '@nestjs/swagger';

export class AuthDataDto {
  @ApiProperty()
    userId!: number;

  @ApiProperty()
    userName!: string;

  @ApiProperty()
    userLongName!: string;

  @ApiProperty()
    isAdmin!: boolean;

  @ApiProperty()
    workspaces!: WorkspaceGroupDto[];

  @ApiProperty()
    reviews!: ReviewDto[];
}

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

export class WorkspaceDto {
  @ApiProperty()
    id!: number;

  @ApiProperty()
    name!: string;

  @ApiProperty()
    userAccessLevel!: number;
}

export class ReviewDto {
  @ApiProperty()
    id!: number;

  @ApiProperty()
    name!: string;

  @ApiProperty()
    workspaceId!: number;

  @ApiProperty()
    workspaceName?: string;

  @ApiProperty()
    workspaceGroupId?: number;

  @ApiProperty()
    workspaceGroupName?: string;

  @ApiProperty()
    numberOfUnits?: number;
}
