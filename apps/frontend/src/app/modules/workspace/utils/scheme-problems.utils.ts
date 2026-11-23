import { CodingSchemeFactory, VariableInfoInput } from '@iqb/responses';
import { findSchemeProblems, SchemeProblem, SchemeProblemType } from '@studio-lite/shared-code';
import type { UnitCheckFinding } from './unit-check.utils';

/**
 * A text for every problem, saying what is wrong and how to fix it. A type added by a later version
 * of the validation fails the build here instead of showing a bare key.
 */
const PROBLEM_KEYS: Record<SchemeProblemType, string> = {
  NAME_TWICE: 'unit-check.scheme-problem.NAME_TWICE',
  UNREADABLE: 'unit-check.scheme-unreadable',
  INVALID_SOURCE: 'unit-check.scheme-problem.INVALID_SOURCE',
  SOURCE_MISSING: 'unit-check.scheme-problem.SOURCE_MISSING',
  VACANT: 'unit-check.scheme-problem.VACANT',
  MORE_THAN_ONE_SOURCE: 'unit-check.scheme-problem.MORE_THAN_ONE_SOURCE',
  ONLY_ONE_SOURCE: 'unit-check.scheme-problem.ONLY_ONE_SOURCE',
  VALUE_COPY_NOT_FROM_BASE: 'unit-check.scheme-problem.VALUE_COPY_NOT_FROM_BASE',
  RULE_PARAMETER_COUNT_MISMATCH: 'unit-check.scheme-problem.RULE_PARAMETER_COUNT_MISMATCH',
  RULE_REGEX_INVALID: 'unit-check.scheme-problem.RULE_REGEX_INVALID',
  RULE_PARAMETER_INVALID: 'unit-check.scheme-problem.RULE_PARAMETER_INVALID',
  RULE_NUMERIC_RANGE_INVALID: 'unit-check.scheme-problem.RULE_NUMERIC_RANGE_INVALID',
  RULESET_VALUE_ARRAY_POS_INVALID: 'unit-check.scheme-problem.RULESET_VALUE_ARRAY_POS_INVALID'
};

/** A problem the schemer finds, as the unit check and the export dialog name it (#2135). */
export function schemeProblemFinding(problem: Pick<SchemeProblem, 'type' | 'variable'>): UnitCheckFinding {
  return {
    key: PROBLEM_KEYS[problem.type],
    ...(problem.variable !== undefined && { params: { variable: problem.variable } })
  };
}

/** What the schemer finds wrong with a coding scheme, as the unit check names it (#2135). */
export function schemeProblemFindings(
  variables: readonly VariableInfoInput[] | null | undefined,
  scheme: string
): UnitCheckFinding[] {
  return findSchemeProblems(variables, scheme, CodingSchemeFactory.validate).map(schemeProblemFinding);
}
