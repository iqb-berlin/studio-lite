import { ApiProperty } from '@nestjs/swagger';

export class ErrorReportDto {
  @ApiProperty()
  source!: string;

  @ApiProperty()
  messages: { [key: string]: string } = {}
}
