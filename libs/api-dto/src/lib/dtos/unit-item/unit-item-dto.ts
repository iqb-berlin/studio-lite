import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { BaseUnitItemDto } from '@studio-lite-lib/api-dto';

export class UnitItemDto extends IntersectionType(BaseUnitItemDto) {
  @ApiProperty()
    id!: number;
}
