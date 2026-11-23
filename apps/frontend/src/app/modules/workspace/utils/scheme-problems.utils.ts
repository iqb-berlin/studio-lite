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

/**
 * The problems of a base variable whose cause is its element, with what to do in the editor. A rule of
 * its coding stays with the coding, where the rule is written, and so does a coding whose element is
 * gone: an element created again gets another internal id, so only deleting the coding resolves it.
 */
const ELEMENT_PROBLEM_KEYS: Partial<Record<SchemeProblemType, string>> = {
  NAME_TWICE: 'unit-check.element-problem.NAME_TWICE',
  INVALID_SOURCE: 'unit-check.element-problem.INVALID_SOURCE'
};

/** A problem fixed in the editor, as the unit check names it there; none for one fixed in the coding. */
function elementProblemFinding(problem: SchemeProblem): UnitCheckFinding | undefined {
  const key = problem.baseVariable ? ELEMENT_PROBLEM_KEYS[problem.type] : undefined;
  return key && problem.variable !== undefined ? { key, params: { variable: problem.variable } } : undefined;
}

/** What the schemer finds wrong, by the tab it is fixed in. */
export interface SchemeProblemFindings {
  editor: UnitCheckFinding[];
  schemer: UnitCheckFinding[];
}

/**
 * What the schemer finds wrong with a coding scheme, as the unit check names it (#2135): under the
 * editor where the cause is an element, if the workspace shows the editor; under the coding otherwise.
 */
export function schemeProblemFindings(
  variables: readonly VariableInfoInput[] | null | undefined,
  scheme: string,
  editorShown: boolean
): SchemeProblemFindings {
  return findSchemeProblems(variables, scheme, CodingSchemeFactory.validate)
    .reduce<SchemeProblemFindings>((found, problem) => {
      const inEditor = editorShown ? elementProblemFinding(problem) : undefined;
      return inEditor ?
        { ...found, editor: [...found.editor, inEditor] } :
        { ...found, schemer: [...found.schemer, schemeProblemFinding(problem)] };
    }, { editor: [], schemer: [] });
}
