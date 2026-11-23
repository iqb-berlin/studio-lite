import { CodingSchemeFactory, CodingSchemeProblem, VariableInfoInput } from '@iqb/responses';
import { CodingSchemeData, CodingSchemeProblemType } from '@iqbspecs/coding-scheme/coding-scheme.interface';
import type { UnitCheckFinding } from './unit-check.utils';

/**
 * A text for every problem the validation knows, saying what is wrong and how to fix it. A type added
 * by a later version of the validation fails the build here instead of showing a bare key.
 */
const PROBLEM_KEYS: Record<CodingSchemeProblemType | 'NAME_TWICE', string> = {
  NAME_TWICE: 'unit-check.scheme-problem.NAME_TWICE',
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

const UNREADABLE: UnitCheckFinding = { key: 'unit-check.scheme-unreadable' };

function parseScheme(scheme: string): Partial<CodingSchemeData> | undefined {
  try {
    const parsed: unknown = JSON.parse(scheme);
    return parsed && typeof parsed === 'object' ? parsed as Partial<CodingSchemeData> : undefined;
  } catch {
    return undefined;
  }
}

/**
 * What the schemer finds wrong with a coding scheme, as the unit check names it (#2135): each problem
 * of {@link CodingSchemeFactory.validate} -- the check the schemer runs -- once per variable, the ones
 * that break the coding first. An invalid source has several causes in the validation; the one an
 * author meets most, two variables of the same name, gets a text of its own that says which.
 *
 * Only a scheme of the current format is asked: the schemer converts an older one when it opens it,
 * and the validation would hold the old format against it. A scheme the validation cannot read at all
 * is named as such rather than taken for one without problems.
 */
export function schemeProblemFindings(
  variables: readonly VariableInfoInput[] | null | undefined,
  scheme: string
): UnitCheckFinding[] {
  const codingScheme = parseScheme(scheme);
  if (!codingScheme) return [UNREADABLE];
  if (!String(codingScheme.version ?? '').startsWith('3.')) return [];
  const codings = codingScheme.variableCodings ?? [];
  let problems: CodingSchemeProblem[];
  try {
    problems = CodingSchemeFactory.validate(variables ?? [], codings);
  } catch {
    // a coding that is not one -- not an object, or a rule set without rules -- stops the validation
    return [UNREADABLE];
  }
  const nameCounts = new Map<string, number>();
  codings.forEach(coding => {
    if (coding.alias) nameCounts.set(coding.alias, (nameCounts.get(coding.alias) ?? 0) + 1);
  });
  const seen = new Set<string>();
  return problems
    .filter(problem => {
      const key = `${problem.type} ${problem.variableId}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    // a stable sort: the breaking ones first, each kind in the order the validation found them
    .sort((a, b) => Number(b.breaking) - Number(a.breaking))
    .map(problem => {
      const nameTwice = problem.type === 'INVALID_SOURCE' && (nameCounts.get(problem.variableId) ?? 0) > 1;
      return {
        key: PROBLEM_KEYS[nameTwice ? 'NAME_TWICE' : problem.type],
        params: { variable: problem.variableId }
      };
    });
}
