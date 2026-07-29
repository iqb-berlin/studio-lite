// eslint-disable-next-line max-classes-per-file
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CodingSchemeProblemType } from '@iqbspecs/coding-scheme/coding-scheme.interface';

const codingSchemeProblemTypes = {
  VACANT: null,
  SOURCE_MISSING: null,
  INVALID_SOURCE: null,
  RULE_PARAMETER_COUNT_MISMATCH: null,
  RULE_REGEX_INVALID: null,
  RULE_PARAMETER_INVALID: null,
  RULE_NUMERIC_RANGE_INVALID: null,
  RULESET_VALUE_ARRAY_POS_INVALID: null,
  MORE_THAN_ONE_SOURCE: null,
  ONLY_ONE_SOURCE: null,
  VALUE_COPY_NOT_FROM_BASE: null
} satisfies Record<CodingSchemeProblemType, null>;

export const CODING_SCHEME_PROBLEM_TYPES = Object.keys(
  codingSchemeProblemTypes
) as CodingSchemeProblemType[];

export class CodingReportValidationProblemDto {
  @ApiProperty({ enum: CODING_SCHEME_PROBLEM_TYPES })
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

  @ApiPropertyOptional({ type: [CodingReportValidationProblemDto] })
    validationProblems?: CodingReportValidationProblemDto[];

  @ApiProperty()
    codingType!: string;

  @ApiProperty()
    trainingEffort!: string;
}
