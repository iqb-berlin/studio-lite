import {ApiProperty} from '@nestjs/swagger';

export class CreateWorkspaceGroupDto {
  @ApiProperty({example: 'VERA2002'})
  name!: string;

  @ApiProperty()
  settings = {};
}
