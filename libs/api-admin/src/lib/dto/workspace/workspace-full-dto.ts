import { ApiProperty } from '@nestjs/swagger';

export class WorkspaceFullDto {
  @ApiProperty()
  id!: number;

  @ApiProperty({example: 'VERA2002'})
  name!: string;

  @ApiProperty({example: 463})
  groupId!: number;

  @ApiProperty()
  settings = {};
}
