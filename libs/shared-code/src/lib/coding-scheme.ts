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
