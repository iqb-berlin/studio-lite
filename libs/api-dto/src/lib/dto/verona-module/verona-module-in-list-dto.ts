import { ApiProperty } from '@nestjs/swagger';
import { VeronaModuleMetadataDto } from './verona-module-metadata-dto';

export class VeronaModuleInListDto {
  @ApiProperty()
  key!: string;

  @ApiProperty()
  metadata!: VeronaModuleMetadataDto;

  @ApiProperty()
  fileSize?: number;

  @ApiProperty()
  fileDateTime?: number;
}
