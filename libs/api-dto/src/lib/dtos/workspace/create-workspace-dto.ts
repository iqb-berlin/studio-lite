import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWorkspaceDto {
  @ApiProperty({ example: 'VERA2002' })
    name!: string;

  @ApiProperty({ example: 463 })
    groupId!: number;

  @ApiPropertyOptional()
    settings = {};
}
