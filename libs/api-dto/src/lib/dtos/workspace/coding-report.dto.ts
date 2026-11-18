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

/**
 * The values of the coding report are codes; the interface translates them (#2180). A row for a unit
 * whose scheme cannot be read has no variable, so its variable type, coding type and training effort
 * are empty.
 */
export const CODING_REPORT_VALIDATION_STATUSES = [
  'OK', 'WARNING', 'ERROR', 'SCHEME_MISSING_OR_TOO_OLD', 'SCHEME_UNREADABLE'
] as const;
export type CodingReportValidationStatus = typeof CODING_REPORT_VALIDATION_STATUSES[number];

export const CODING_REPORT_VARIABLE_TYPES = ['BASE', 'DERIVED'] as const;
export type CodingReportVariableType = typeof CODING_REPORT_VARIABLE_TYPES[number];

export const CODING_REPORT_CODING_TYPES = ['AUTOMATIC', 'MANUAL', 'SEMI_AUTOMATIC', 'NO_RULES'] as const;
export type CodingReportCodingType = typeof CODING_REPORT_CODING_TYPES[number];

export const CODING_REPORT_TRAINING_EFFORTS = ['INCREASED', 'NORMAL'] as const;
export type CodingReportTrainingEffort = typeof CODING_REPORT_TRAINING_EFFORTS[number];

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

  // `unit` is a link, whose address would decide the order; the table sorts by the key (#1872)
  @ApiProperty()
  unitKey!: string;

  @ApiProperty({ })
  variable!: string;

  @ApiProperty({ enum: [...CODING_REPORT_VARIABLE_TYPES, ''] })
  variableType!: CodingReportVariableType | '';

  @ApiProperty()
  item!: string;

  @ApiProperty({ enum: CODING_REPORT_VALIDATION_STATUSES })
  validation!: CodingReportValidationStatus;

  @ApiPropertyOptional({ type: [CodingReportValidationProblemDto] })
  validationProblems?: CodingReportValidationProblemDto[];

  @ApiProperty({ enum: [...CODING_REPORT_CODING_TYPES, ''] })
  codingType!: CodingReportCodingType | '';

  @ApiProperty({ enum: [...CODING_REPORT_TRAINING_EFFORTS, ''] })
  trainingEffort!: CodingReportTrainingEffort | '';
}
