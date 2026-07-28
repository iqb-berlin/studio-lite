import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CodingSchemeProblemType } from '@iqbspecs/coding-scheme/coding-scheme.interface';

export class CodingReportValidationProblemDto {
  @ApiProperty()
    type!: CodingSchemeProblemType;

  @ApiProperty()
    breaking!: boolean;

  @ApiPropertyOptional()
    code?: string;
}

export class CodingReportDto {
  @ApiProperty({ })
    unit: string | undefined;

  @ApiProperty({ })
    variable!: string;

  @ApiProperty()
    variableType!: string;

  @ApiProperty()
    item!: string;

  @ApiProperty()
    validation!: string;

  @ApiProperty({ type: [CodingReportValidationProblemDto] })
    validationProblems!: CodingReportValidationProblemDto[];

  @ApiProperty()
    codingType!: string;

  @ApiProperty()
    trainingEffort!: string;
}
