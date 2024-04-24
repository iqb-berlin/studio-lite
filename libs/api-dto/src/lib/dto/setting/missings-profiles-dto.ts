import { ApiProperty } from '@nestjs/swagger';

export class MissingsProfilesDto {
  @ApiProperty()
    id?: number;

  @ApiProperty()
    label!: string;

  @ApiProperty()
    missings?: string;
}
