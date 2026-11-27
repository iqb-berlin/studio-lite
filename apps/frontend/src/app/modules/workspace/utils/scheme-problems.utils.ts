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

/**
 * A problem the schemer finds, as the export dialog names it, and the unit check where it knows no more
 * of it (#2135).
 */
export function schemeProblemFinding(problem: Pick<SchemeProblem, 'type' | 'variable'>): UnitCheckFinding {
  return {
    key: PROBLEM_KEYS[problem.type],
    ...(problem.variable !== undefined && { params: { variable: problem.variable } })
  };
}

/**
 * A problem with the sources of a derived variable, naming them, so that what to change can be found in
 * the coding: the sources missing, those of a copy, the only one (#2135).
 * None where the sources are not known; the general text stands then.
 */
function sourceProblemFinding(problem: SchemeProblem): UnitCheckFinding | undefined {
  const variable = problem.variable;
  if (variable === undefined) return undefined;
  const sources = problem.sources;
  const finding = (key: string, params: Record<string, string> = {}): UnitCheckFinding => ({
    // unit-check.scheme-problem-detail.SOURCE_MISSING_ELEMENT, unit-check.scheme-problem-detail.SOURCE_MISSING_NONE,
    // unit-check.scheme-problem-detail.SOURCE_MISSING_ONE, unit-check.scheme-problem-detail.SOURCE_MISSING_MANY,
    // unit-check.scheme-problem-detail.MORE_THAN_ONE_SOURCE, unit-check.scheme-problem-detail.ONLY_ONE_SOURCE,
    // unit-check.scheme-problem-detail.VALUE_COPY_NOT_FROM_BASE
    key: `unit-check.scheme-problem-detail.${key}`,
    params: { variable, ...params }
  });
  switch (problem.type) {
    case 'SOURCE_MISSING': {
      // a base variable has no sources: its coding is left of an element that is gone
      if (!sources) return finding('SOURCE_MISSING_ELEMENT');
      if (!sources.length) return finding('SOURCE_MISSING_NONE');
      const missing = problem.missingSources ?? [];
      if (missing.length === 1) return finding('SOURCE_MISSING_ONE', { source: missing[0] });
      return missing.length ? finding('SOURCE_MISSING_MANY', { sources: missing.join(', ') }) : undefined;
    }
    case 'MORE_THAN_ONE_SOURCE': {
      // Which value a copy takes follows the order of the responses, not that of the sources: it is not
      // named. A source given twice is one.
      const distinct = [...new Set(sources ?? [])];
      return distinct.length > 1 ? finding(problem.type, { sources: distinct.join(', ') }) : undefined;
    }
    case 'ONLY_ONE_SOURCE':
    case 'VALUE_COPY_NOT_FROM_BASE':
      return sources?.length ? finding(problem.type, { source: sources[0] }) : undefined;
    default:
      return undefined;
  }
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
 * What breaks the coding is an error. What the coding gets through all the same -- a sum of one source,
 * say -- is a warning, as the coding report calls it: the result is most likely not the one meant.
 */
export function schemeProblemFindings(
  variables: readonly VariableInfoInput[] | null | undefined,
  scheme: string,
  editorShown: boolean
): SchemeProblemFindings {
  return findSchemeProblems(variables, scheme, CodingSchemeFactory.validate)
    .reduce<SchemeProblemFindings>((found, problem) => {
      const asFound = (finding: UnitCheckFinding): UnitCheckFinding => (problem.breaking ?
        finding :
        { ...finding, level: 'warning' });
      const inEditor = editorShown ? elementProblemFinding(problem) : undefined;
      const inCoding = (): UnitCheckFinding => sourceProblemFinding(problem) ?? schemeProblemFinding(problem);
      return inEditor ?
        { ...found, editor: [...found.editor, asFound(inEditor)] } :
        { ...found, schemer: [...found.schemer, asFound(inCoding())] };
    }, { editor: [], schemer: [] });
}
