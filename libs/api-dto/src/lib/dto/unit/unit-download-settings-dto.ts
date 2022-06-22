import { ApiProperty } from '@nestjs/swagger';

export class UnitDownloadSettingsDto {
  @ApiProperty()
  unitIdList!: number[];

  @ApiProperty()
  addPlayers = false;

  @ApiProperty()
  addTestTakersReview = 0;

  @ApiProperty()
  addTestTakersMonitor = 0;

  @ApiProperty()
  addTestTakersHot = 0;

  @ApiProperty()
  passwordLess = false;
}
