import { ApiProperty } from '@nestjs/swagger';

export class ConfigDto {
  @ApiProperty({
    type: 'object',
    additionalProperties: { type: 'string' },
    description: 'Per language code; a language without a text of its own shows the German one (#2186).'
  })
  appTitle!: Record<string, string>;

  @ApiProperty({
    type: 'object',
    additionalProperties: { type: 'string' },
    description: 'Per language code; a language without a text of its own shows the German one (#2186).'
  })
  introHtml!: Record<string, string>;

  @ApiProperty({
    type: 'object',
    additionalProperties: { type: 'string' },
    description: 'Per language code; a language without a text of its own shows the German one (#2186).'
  })
  imprintHtml!: Record<string, string>;

  @ApiProperty()
  emailSubject = '';

  @ApiProperty()
  emailBody = '';

  @ApiProperty({
    type: 'object',
    additionalProperties: { type: 'string' },
    description: 'Per language code; a language without a text of its own shows the German one (#2186).'
  })
  globalWarningText!: Record<string, string>;

  @ApiProperty()
  globalWarningExpiredDay?: Date;

  @ApiProperty()
  globalWarningExpiredHour?: number;

  @ApiProperty()
  hasUsers = true;
}
