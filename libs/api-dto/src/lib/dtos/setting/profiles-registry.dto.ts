import { ApiProperty } from '@nestjs/swagger';

export class ProfilesRegistryDto {
  @ApiProperty()
    csvUrl = 'https://www.w3id.org/iqb/metadata-registry';
}
