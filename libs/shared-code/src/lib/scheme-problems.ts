import type { CodingSchemeProblem, VariableInfoInput } from '@iqb/responses';
import type {
  CodingSchemeData, CodingSchemeProblemType, VariableCodingData
} from '@iqbspecs/coding-scheme/coding-scheme.interface';

/**
 * A problem of a coding scheme as the schemer sees it, or one of two the studio tells apart:
 * NAME_TWICE, the most common cause of an invalid source, and UNREADABLE, a scheme the validation
 * cannot read at all. VACANT, a variable without codes, is left out: such a variable is mostly not
 * meant to be coded -- the storage area of a drag-and-drop task, say -- and is not worth a warning.
 */
export type SchemeProblemType = Exclude<CodingSchemeProblemType, 'VACANT'> | 'NAME_TWICE' | 'UNREADABLE';

type NamedProblem = CodingSchemeProblem & { type: Exclude<CodingSchemeProblemType, 'VACANT'> };

export interface SchemeProblem {
  type: SchemeProblemType;
  /** The variable as the schemer names it, its alias or its id; none for an unreadable scheme. */
  variable?: string;
  /** Whether the coding fails with it, rather than only being incomplete. */
  breaking: boolean;
  /**
   * Whether the variable is a base variable whose element is in the unit, and every other coding of its
   * name is one too: where the cause lies with the element, it is fixed in the editor (#2135). A name
   * that a derived variable or an orphaned coding shares is fixed in the coding.
   */
  baseVariable: boolean;
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

const UNREADABLE: SchemeProblem = { type: 'UNREADABLE', breaking: true, baseVariable: false };

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
  const elementIds = new Set((variables ?? []).map(variable => variable.id));
  // whether all codings of a name -- as the schemer names a variable, by alias or id -- are base ones
  // with their element
  const baseByName = new Map<string, boolean>();
  // whether all codings of a name belong to elements that are gone and code nothing: leftovers, which
  // lose nothing when deleted and fail no coding -- the save drops those of elements without value
  // itself (#2135). One coding of the name that does code keeps its problem.
  const emptyLeftovers = new Map<string, boolean>();
  codings.forEach(coding => {
    if (coding.alias) nameCounts.set(coding.alias, (nameCounts.get(coding.alias) ?? 0) + 1);
    const name = coding.alias || coding.id;
    const base = coding.sourceType === 'BASE' || coding.sourceType === 'BASE_NO_VALUE';
    baseByName.set(name, (baseByName.get(name) ?? true) && base && elementIds.has(coding.id));
    const leftover = base && !elementIds.has(coding.id) && !coding.codes?.length;
    emptyLeftovers.set(name, (emptyLeftovers.get(name) ?? true) && leftover);
  });
  const seen = new Set<string>();
  return problems
    .filter((problem): problem is NamedProblem => problem.type !== 'VACANT')
    .filter(problem => !(problem.type === 'SOURCE_MISSING' && emptyLeftovers.get(problem.variableId)))
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
      breaking: problem.breaking,
      baseVariable: baseByName.get(problem.variableId) ?? false
    }));
}
