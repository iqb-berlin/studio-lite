import { ApiProperty } from '@nestjs/swagger';

export class WorkspaceGroupInListDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  name!: string;
}
