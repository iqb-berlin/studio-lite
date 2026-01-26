import { ApiProperty } from '@nestjs/swagger';

export class WorkspaceDto {
  @ApiProperty()
    id!: number;

  @ApiProperty()
    name!: string;

  @ApiProperty()
    userAccessLevel!: number;
}
