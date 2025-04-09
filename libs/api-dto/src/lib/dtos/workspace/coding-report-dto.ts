import { ApiProperty } from '@nestjs/swagger';

export class CodingReportDto {
  @ApiProperty()
    isDuplicate?: boolean;

  @ApiProperty({ })
    unit: string | undefined;

  @ApiProperty({ })
    variable!: string;

  @ApiProperty()
    item!: string;

  @ApiProperty()
    validation!: string;

  @ApiProperty()
    codingType!: string;
}
