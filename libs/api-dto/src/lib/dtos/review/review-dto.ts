import { ApiProperty } from '@nestjs/swagger';

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
