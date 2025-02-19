import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { MetadataDto } from '@studio-lite-lib/api-dto';

export class UnitProfileMetadataDto extends IntersectionType(MetadataDto) {
  @ApiProperty()
    unitId!: number;
}
