import { ApiProperty } from '@nestjs/swagger';

export class EmailTemplateDto {
  @ApiProperty()
    emailSubject = '';

  @ApiProperty()
    emailBody = '';
}
