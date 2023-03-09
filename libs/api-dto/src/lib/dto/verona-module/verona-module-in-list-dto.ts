import { ApiProperty } from '@nestjs/swagger';
import { VeronaModuleMetadataDto } from './verona-module-metadata-dto';

export class VeronaModuleInListDto {
  [index: string]: unknown;

  @ApiProperty()
    key!: string;

  @ApiProperty()
    sortKey!: string;

  @ApiProperty()
    metadata!: VeronaModuleMetadataDto;

  @ApiProperty()
    fileSize?: number;

  @ApiProperty()
    fileDateTime?: number;
}
