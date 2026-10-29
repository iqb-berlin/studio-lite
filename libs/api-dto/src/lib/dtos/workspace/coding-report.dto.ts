// eslint-disable-next-line max-classes-per-file
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CodingSchemeProblemType } from '@iqbspecs/coding-scheme/coding-scheme.interface';

/**
 * The problems of the coding scheme spec, plus those the studio's coding report finds itself: a code
 * that is neither coded by rules nor by hand can never be assigned (#1873).
 */
export type CodingReportProblemType = CodingSchemeProblemType | 'CODE_WITHOUT_RULES';

const codingReportProblemTypes = {
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
  VALUE_COPY_NOT_FROM_BASE: null,
  CODE_WITHOUT_RULES: null
} satisfies Record<CodingReportProblemType, null>;

export const CODING_SCHEME_PROBLEM_TYPES = Object.keys(
  codingReportProblemTypes
) as CodingReportProblemType[];

export class CodingReportValidationProblemDto {
  @ApiProperty({ enum: CODING_SCHEME_PROBLEM_TYPES })
  type!: CodingReportProblemType;

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
