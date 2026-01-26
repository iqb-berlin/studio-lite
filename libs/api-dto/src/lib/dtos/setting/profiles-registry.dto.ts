import { ApiProperty } from '@nestjs/swagger';

export class ProfilesRegistryDto {
  @ApiProperty()
    csvUrl =
      'https://raw.githubusercontent.com/iqb-vocabs/profile-registry/master/registry.csv';
}
