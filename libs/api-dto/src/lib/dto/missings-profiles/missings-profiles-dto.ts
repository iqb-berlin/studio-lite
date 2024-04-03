// eslint-disable-next-line max-classes-per-file
import { ApiProperty } from '@nestjs/swagger';

export class MissingsProfilesDto {
  @ApiProperty()
    id!: number;

  @ApiProperty()
    label?: string;

  @ApiProperty()
    missings?: Missing;
}

export class Missing {
  @ApiProperty()
    id!: string;

  @ApiProperty()
    label!: string;
}
