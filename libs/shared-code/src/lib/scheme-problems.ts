import type { CodingSchemeProblem, VariableInfoInput } from '@iqb/responses';
import type {
  CodingSchemeData, CodingSchemeProblemType, VariableCodingData
} from '@iqbspecs/coding-scheme/coding-scheme.interface';

/**
 * A problem of a coding scheme as the schemer sees it, or one of two the studio tells apart:
 * NAME_TWICE, the most common cause of an invalid source, and UNREADABLE, a scheme the validation
 * cannot read at all.
 */
export type SchemeProblemType = CodingSchemeProblemType | 'NAME_TWICE' | 'UNREADABLE';

export interface SchemeProblem {
  type: SchemeProblemType;
  /** The variable as the schemer names it, its alias or its id; none for an unreadable scheme. */
  variable?: string;
  /** Whether the coding fails with it, rather than only being incomplete. */
  breaking: boolean;
}

/**
 * The validation the schemer runs, `CodingSchemeFactory.validate` of `@iqb/responses`. It is handed in
 * rather than imported: it brings mathjs along, and everything that imports this library -- every
 * page of the frontend, every spec of the API -- would load it (#2135).
 */
export type SchemeValidation = (
  variables: readonly VariableInfoInput[],
  codings: VariableCodingData[]
) => CodingSchemeProblem[];

const UNREADABLE: SchemeProblem = { type: 'UNREADABLE', breaking: true };

function parseScheme(scheme: string): Partial<CodingSchemeData> | undefined {
  try {
    const parsed: unknown = JSON.parse(scheme);
    return parsed && typeof parsed === 'object' ? parsed as Partial<CodingSchemeData> : undefined;
  } catch {
    return undefined;
  }
}

/**
 * What the schemer finds wrong with a coding scheme (#2135): each problem of the
 * {@link SchemeValidation} -- the check the schemer runs -- once per variable, the ones
 * that break the coding first. The unit check shows all of them, the export dialog warns about the
 * breaking ones; both ask here, so that they cannot drift apart.
 *
 * Only a scheme of version 3 or later is asked: the schemer converts an older one when it opens it,
 * and the validation would hold the old format against it. A scheme the validation cannot read is
 * named as such rather than taken for one without problems; coding with it fails.
 */
export function findSchemeProblems(
  variables: readonly VariableInfoInput[] | null | undefined,
  scheme: string | null | undefined,
  validate: SchemeValidation
): SchemeProblem[] {
  if (!scheme) return [];
  const codingScheme = parseScheme(scheme);
  if (!codingScheme) return [UNREADABLE];
  // from version 3 on: a scheme without a version is of the oldest format
  if (!(Number.parseInt(String(codingScheme.version ?? ''), 10) >= 3)) return [];
  const codings = codingScheme.variableCodings ?? [];
  let problems: CodingSchemeProblem[];
  try {
    problems = validate(variables ?? [], codings);
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
    .map(problem => ({
      type: problem.type === 'INVALID_SOURCE' && (nameCounts.get(problem.variableId) ?? 0) > 1 ?
        'NAME_TWICE' :
        problem.type,
      variable: problem.variableId,
      breaking: problem.breaking
    }));
}
