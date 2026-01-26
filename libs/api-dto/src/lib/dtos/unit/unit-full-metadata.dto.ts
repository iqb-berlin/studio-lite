import { ApiProperty } from '@nestjs/swagger';
import { UnitItemWithMetadataDto, UnitMetadataDto } from '@studio-lite-lib/api-dto';

export class UnitFullMetadataDto {
  @ApiProperty()
    profiles?: UnitMetadataDto[];

  @ApiProperty()
    items?: UnitItemWithMetadataDto[];
}
