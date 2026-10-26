import { ApiProperty } from '@nestjs/swagger';
import { UnitLastChangedDto } from './unit-last-changed.dto';

export class UnitInViewDto extends UnitLastChangedDto {
  @ApiProperty()
  key!: string;

  @ApiProperty()
  name?: string;

  @ApiProperty()
  groupName?: string;

  @ApiProperty()
  id!: number;

  @ApiProperty()
  workspaceName?: string;

  @ApiProperty()
  workspaceId!: number;
}
