import { ApiProperty } from '@nestjs/swagger';

export class UsersWorkspaceInListDto {
  @ApiProperty()
    id!: number;

  @ApiProperty()
    name!: string;

  @ApiProperty({ example: 463 })
    groupId!: number;

  @ApiProperty()
    dropBoxId!: number;

  @ApiProperty()
    userAccessLevel!: number;

  @ApiProperty()
    unitsCount!: number;
}
