import { ApiProperty } from '@nestjs/swagger';

export class ConfigDto {
  @ApiProperty()
    appTitle!: string;

  @ApiProperty()
    introHtml = '';

  @ApiProperty()
    imprintHtml = '';

  @ApiProperty()
    emailBody = '';

  @ApiProperty()
    globalWarningText = '';

  @ApiProperty()
    globalWarningExpiredDay?: Date;

  @ApiProperty()
    globalWarningExpiredHour?: number;

  @ApiProperty()
    hasUsers = true;
}
