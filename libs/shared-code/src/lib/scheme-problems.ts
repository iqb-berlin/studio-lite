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
 * Elements the schemer deactivated, as elements without value: every coding of theirs says "no value"
 * while the element has one. The schemer's "Deaktivieren" does that on purpose and the coding then
 * skips the element, but the validation takes it for an invalid source. Its other checks -- an id or a
 * name used twice -- still see the element (#2135).
 */
function withDeactivatedAsNoValue(
  elements: readonly VariableInfoInput[],
  codings: VariableCodingData[]
): VariableInfoInput[] {
  const deactivated = new Set(codings
    .filter(coding => coding?.sourceType === 'BASE_NO_VALUE')
    .map(coding => coding.id));
  codings
    .filter(coding => coding?.sourceType !== 'BASE_NO_VALUE')
    .forEach(coding => deactivated.delete(coding?.id));
  return elements.map(variable => (
    deactivated.has(variable.id) ? { ...variable, type: 'no-value' as const } : variable
  ));
}

/**
 * The codings without the position -1 in their rule sets. Older schemers wrote it for "no position",
 * and the coding reads it so: a negative position picks no element, and the rules see the whole value.
 * The validation takes every negative position for an invalid one; any other it still sees (#2135).
 */
function withoutNoPosition(codings: VariableCodingData[]): VariableCodingData[] {
  return codings.map(coding => (Array.isArray(coding?.codes) ?
    {
      ...coding,
      codes: coding.codes.map(code => (Array.isArray(code?.ruleSets) ?
        {
          ...code,
          ruleSets: code.ruleSets.map(ruleSet => (ruleSet?.valueArrayPos === -1 ?
            { ...ruleSet, valueArrayPos: undefined } :
            ruleSet))
        } :
        code))
    } :
    coding));
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
  // the saved list as it is, read as findVariableIdConflicts reads it: an entry that is no variable
  // stops the validation, and the scheme would be taken for unreadable (#2135)
  const elements = (Array.isArray(variables) ? variables : [])
    .filter(variable => !!variable && typeof variable === 'object');
  let problems: CodingSchemeProblem[];
  try {
    // validated as the coding reads them, where the validation is stricter than the coding
    problems = validate(withDeactivatedAsNoValue(elements, codings), withoutNoPosition(codings));
  } catch {
    // codings that are not a list, or a coding that is not one -- not an object, or a rule set without
    // rules -- stop the validation and the adjustments before it
    return [UNREADABLE];
  }
  const count = (ids: string[]) => ids.reduce(
    (counts, id) => counts.set(id, (counts.get(id) ?? 0) + 1),
    new Map<string, number>()
  );
  const elementIdCounts = count(elements.map(variable => variable.id));
  const codingIdCounts = count(codings.map(coding => coding.id));
  // the codings of each name, as the schemer names a variable: by alias, or by id where it has none
  const codingIdsByName = new Map<string, Set<string>>();
  // whether all codings of a name are base ones with their element. A coding that occurs more often
  // than its element is no such one: the coding was doubled, not the element, and it is deleted there.
  const baseByName = new Map<string, boolean>();
  // whether all codings of a name belong to elements that are gone and code nothing: leftovers, which
  // lose nothing when deleted and fail no coding -- the save drops those of elements without value
  // itself (#2135). One coding of the name that does code keeps its problem.
  const emptyLeftovers = new Map<string, boolean>();
  const codingById = new Map(codings.map(coding => [coding.id, coding]));
  // a derived variable may take the name of the base variable it derives from: the schemer allows it
  // as long as no other coding takes that name as well (#2135)
  const shadowsItsSource = (coding: VariableCodingData | undefined): boolean => !!coding?.alias &&
    coding.alias !== coding.id &&
    coding.sourceType !== 'BASE' && coding.sourceType !== 'BASE_NO_VALUE' &&
    codingById.get(coding.alias)?.sourceType === 'BASE' &&
    (coding.deriveSources ?? []).includes(coding.alias);
  // Two codings of one name, told apart by their ids: the same coding twice is a doubled coding, not
  // a name used twice -- renaming would not resolve it.
  const nameUsedTwice = (name: string): boolean => {
    const ids = [...(codingIdsByName.get(name) ?? [])];
    if (ids.length < 2) return false;
    const others = ids.filter(id => id !== name);
    return !(ids.length === 2 && others.length === 1 && shadowsItsSource(codingById.get(others[0])));
  };
  codings.forEach(coding => {
    const name = coding.alias || coding.id;
    codingIdsByName.set(name, (codingIdsByName.get(name) ?? new Set<string>()).add(coding.id));
    const base = coding.sourceType === 'BASE' || coding.sourceType === 'BASE_NO_VALUE';
    const elementCount = elementIdCounts.get(coding.id) ?? 0;
    const withElement = elementCount > 0 && (codingIdCounts.get(coding.id) ?? 0) <= elementCount;
    baseByName.set(name, (baseByName.get(name) ?? true) && base && withElement);
    const leftover = base && !elementCount && !coding.codes?.length;
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
      type: problem.type === 'INVALID_SOURCE' && nameUsedTwice(problem.variableId) ?
        'NAME_TWICE' :
        problem.type,
      variable: problem.variableId,
      breaking: problem.breaking,
      baseVariable: baseByName.get(problem.variableId) ?? false
    }));
}
