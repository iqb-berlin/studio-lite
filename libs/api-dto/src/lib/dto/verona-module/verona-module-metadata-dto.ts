import { ApiProperty } from '@nestjs/swagger';
import {VeronaModuleMetadataDto} from "./verona-module-in-list-dto";

export class VeronaModuleInListDto {
  @ApiProperty()
  key!: string;

  @ApiProperty()
  metadata!: VeronaModuleMetadataDto;
}
