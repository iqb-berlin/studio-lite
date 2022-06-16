import { ApiProperty } from '@nestjs/swagger';

export class WorkspaceGroupFullDto {
  @ApiProperty()
  id!: number;

  @ApiProperty({ example: 'VERA2002' })
  name?: string;

  @ApiProperty()
  settings? = {};
}
