import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { UnitItemDto, UnitItemMetadataDto } from '@studio-lite-lib/api-dto';

export class UnitItemWithMetadataDto extends IntersectionType(UnitItemDto) {
  @ApiProperty()
    profiles!: UnitItemMetadataDto[];
}
