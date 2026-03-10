import { ApiProperty } from '@nestjs/swagger';
import { UnitItemDto } from './unit-item.dto';

export class UnitItemInViewDto extends UnitItemDto {
  @ApiProperty()
    unitKey!: string;

  @ApiProperty()
    unitName!: string;

  @ApiProperty()
    workspaceId!: number;

  @ApiProperty()
    workspaceName!: string;
}
