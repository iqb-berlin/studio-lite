import { ApiProperty } from '@nestjs/swagger';

export class ErrorReportDto {
  @ApiProperty()
  source!: string;

  @ApiProperty()
  errors: { [key: string]: string } = {}
}
