import {
  CodingSchemeData,
  VariableCodingData
} from '@iqbspecs/coding-scheme/coding-scheme.interface';

/*
 * What both export formats read from a unit's coding scheme, and the unit check with them (#2135).
 */

/** Whether the unit has a coding scheme -- what decides whether the export writes one. */
export function hasCodingScheme(scheme?: string | null): boolean {
  return !!scheme;
}

/**
 * The codings of a scheme that derive a variable rather than code one the player reports -- what
 * both export formats list as derived variables. A missing or unreadable scheme derives nothing,
 * and neither does an entry that is no coding: the export check asks this of every unit of a
 * workspace, and one broken scheme must not fail it for all of them (#2135).
 */
export function parseDerivedCodings(scheme: string | null | undefined): VariableCodingData[] {
  if (!scheme) return [];
  let codingScheme: Partial<CodingSchemeData> | null;
  try {
    codingScheme = JSON.parse(scheme) as Partial<CodingSchemeData> | null;
  } catch {
    return [];
  }
  const codings: unknown = codingScheme?.variableCodings;
  if (!Array.isArray(codings)) return [];
  return codings.filter((coding: unknown): coding is VariableCodingData => (
    !!coding && typeof coding === 'object' &&
    (coding as VariableCodingData).sourceType !== 'BASE' &&
    (coding as VariableCodingData).sourceType !== 'BASE_NO_VALUE'
  ));
}

/**
 * The id a derived variable is exported under: its alias, or its id where it has none. The
 * conflict check asks the same, so it names exactly the ids the export writes (#2119).
 */
export function derivedVariableId(coding: Pick<VariableCodingData, 'id' | 'alias'>): string {
  return coding.alias || coding.id;
}

/**
 * The scheme as the server stores it once the variables of the unit are saved: a base coding takes the
 * name of its element; the coding of an element without a value goes with the element, as it has
 * nothing to code; a base coding whose element is gone stays, so that the schemer shows it as
 * orphaned. The save of the definition asks it of the variables it receives, the unit check of those
 * the editor reports before they are saved (#2135); both ask here, so that they cannot drift apart.
 *
 * A scheme without a list of codings stays as it is: one stored before 9.3.0 may have none, or be no
 * JSON at all, and the save must not fail on it (#2057).
 */
export function schemeWithVariables(
  scheme: string,
  variables: readonly { id: string; alias?: string }[]
): string {
  let parsed: unknown;
  try {
    parsed = JSON.parse(scheme);
  } catch {
    return scheme;
  }
  const schemeObject = parsed as Partial<CodingSchemeData> | null;
  const codings: unknown = schemeObject?.variableCodings;
  if (!Array.isArray(codings)) return scheme;
  // the first variable of an id names its codings, as the save always did; a list that is not one, or
  // an entry that is no variable, must not fail the save or the unit check
  const names = new Map<string, string>();
  (Array.isArray(variables) ? variables : [])
    .filter(variable => !!variable && typeof variable === 'object')
    .forEach(variable => {
      if (!names.has(variable.id)) names.set(variable.id, variable.alias || variable.id);
    });
  const variableCodings = codings
    .map((coding: unknown) => {
      if (!coding || typeof coding !== 'object') return coding;
      const { id, sourceType } = coding as VariableCodingData;
      const name = names.get(id);
      if (sourceType === 'BASE_NO_VALUE') return name === undefined ? undefined : { ...coding, alias: name };
      if (sourceType === 'BASE' && name !== undefined) return { ...coding, alias: name };
      return coding;
    })
    .filter(coding => coding !== undefined);
  return JSON.stringify({ ...schemeObject, variableCodings });
}
