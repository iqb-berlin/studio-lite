import { ApiProperty } from '@nestjs/swagger';

export class EmailTemplateDto {
  @ApiProperty({
    type: 'object',
    additionalProperties: { type: 'string' },
    description: 'The subject per language code; a language without one takes the German one (#2186).'
  })
  emailSubject: Record<string, string> = {};

  @ApiProperty({
    type: 'object',
    additionalProperties: { type: 'string' },
    description: 'The text per language code; a language without one takes the German one (#2186).'
  })
  emailBody: Record<string, string> = {};
}
