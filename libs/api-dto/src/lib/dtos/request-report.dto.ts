import { ApiProperty } from '@nestjs/swagger';

export class RequestReportDto {
  @ApiProperty()
    source!: string;

  @ApiProperty()
    messages: { objectKey: string, messageKey: string }[] = [];
}
