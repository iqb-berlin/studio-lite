import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { MetadataDto } from '@studio-lite-lib/api-dto';

export class UnitMetadataDto extends IntersectionType(MetadataDto) {
  @ApiProperty()
    unitId!: number;
}
