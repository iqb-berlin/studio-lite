import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { MetadataDto } from '@studio-lite-lib/api-dto';

export class UnitItemMetadataDto extends IntersectionType(MetadataDto) {
  @ApiProperty()
    unitItemUuid!: string;
}
