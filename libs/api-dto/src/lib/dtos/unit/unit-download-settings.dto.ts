// eslint-disable-next-line max-classes-per-file
import { ApiProperty } from '@nestjs/swagger';

export class UnitDownloadSettingsDto {
  @ApiProperty()
  unitIdList!: number[];

  @ApiProperty()
  exportFormat: 'xml' | 'json' = 'xml';

  @ApiProperty()
  addPlayers = false;

  @ApiProperty()
  addComments = false;

  @ApiProperty()
  addRichNotes = false;

  // The three files below were written unconditionally before they became optional, and no pipe
  // fills in the defaults of this class -- so a caller that does not know them must keep getting
  // them: a missing value means "add", only false leaves the file out.
  @ApiProperty({ required: false, default: true })
  addMetadata?: boolean;

  // JSON only: in XML the items live inside the metadata file and follow addMetadata.
  @ApiProperty({ required: false, default: true })
  addItems?: boolean;

  @ApiProperty({ required: false, default: true })
  addCodingScheme?: boolean;

  @ApiProperty()
  addTestTakersReview = 0;

  @ApiProperty()
  addTestTakersMonitor = 0;

  @ApiProperty()
  addTestTakersHot = 0;

  @ApiProperty()
  passwordLess = false;

  @ApiProperty()
  bookletId?: string;

  @ApiProperty()
  bookletLabel?: string;

  @ApiProperty()
  groupLabel?: string;

  @ApiProperty()
  monitorBookletVisibility?: 'visible' | 'collapsed' | 'hidden';

  @ApiProperty()
  bookletSettings: UnitDownloadBookletSettingsDto[] = [];
}

export class UnitDownloadBookletSettingsDto {
  @ApiProperty()
  key!: string;

  @ApiProperty()
  value!: string;
}
