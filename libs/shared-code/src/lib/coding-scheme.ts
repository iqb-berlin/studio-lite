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
 * both export formats list as derived variables. A missing or unreadable scheme derives nothing.
 */
export function parseDerivedCodings(scheme: string | null | undefined): VariableCodingData[] {
  if (!scheme) return [];
  let codingScheme: CodingSchemeData;
  try {
    codingScheme = JSON.parse(scheme) as CodingSchemeData;
  } catch {
    return [];
  }
  return codingScheme?.variableCodings?.filter(
    vc => vc.sourceType !== 'BASE' && vc.sourceType !== 'BASE_NO_VALUE'
  ) ?? [];
}

/**
 * The id a derived variable is exported under: its alias, or its id where it has none. The
 * conflict check asks the same, so it names exactly the ids the export writes (#2119).
 */
export function derivedVariableId(coding: Pick<VariableCodingData, 'id' | 'alias'>): string {
  return coding.alias || coding.id;
}
