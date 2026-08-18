import { ApiProperty } from '@nestjs/swagger';

export class ProfilesRegistryDto {
  @ApiProperty()
    csvUrl = 'https://w3id.org/iqb/metadata-registry';
}
