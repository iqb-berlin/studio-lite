import { ApiProperty } from '@nestjs/swagger';

export class ConfigFullDto {
  @ApiProperty()
  appTitle!: string;

  @ApiProperty()
  introHtml = '';

  @ApiProperty()
  imprintHtml = '';

  @ApiProperty()
  globalWarningText = '';

  @ApiProperty()
  globalWarningExpiredDay?: Date;

  @ApiProperty()
  globalWarningExpiredHour?: number;
}
