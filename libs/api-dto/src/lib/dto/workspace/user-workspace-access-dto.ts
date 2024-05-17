import { ApiProperty } from '@nestjs/swagger';

export class UserWorkspaceAccessDto {
  @ApiProperty()
    id!: number;

  @ApiProperty()
    hasWriteAccess!: boolean;
}
