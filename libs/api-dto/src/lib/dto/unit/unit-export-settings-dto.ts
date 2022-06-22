import { ApiProperty } from '@nestjs/swagger';

export class UnitExportSettingsDto {
  @ApiProperty()
  unitIdList!: number[];

  @ApiProperty()
  addBookletAndPlayers = false;

  @ApiProperty()
  addTestTakersReview = 0;

  @ApiProperty()
  addTestTakersMonitor = 0;

  @ApiProperty()
  addTestTakersHot = 0;

  @ApiProperty()
  passwordLess = false;
}
