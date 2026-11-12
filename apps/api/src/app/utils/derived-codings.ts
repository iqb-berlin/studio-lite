import { UnitSchemeDto } from '@studio-lite-lib/api-dto';
import {
  CodingSchemeData,
  VariableCodingData
} from '@iqbspecs/coding-scheme/coding-scheme.interface';

/**
 * The codings of a scheme that derive a variable rather than code one the player reports -- what
 * both export formats list as derived variables. A missing or unreadable scheme derives nothing.
 */
export function parseDerivedCodings(schemeData: UnitSchemeDto): VariableCodingData[] {
  if (!schemeData?.scheme) return [];
  let codingScheme: CodingSchemeData;
  try {
    codingScheme = JSON.parse(schemeData.scheme) as CodingSchemeData;
  } catch {
    return [];
  }
  return codingScheme?.variableCodings?.filter(
    vc => vc.sourceType !== 'BASE' && vc.sourceType !== 'BASE_NO_VALUE'
  ) ?? [];
}

/**
 * The id a derived variable is exported under: its alias, or its id where it has none. The id
 * check of the export dialog asks the same, so it names exactly the ids the export writes (#2119).
 */
export function derivedVariableId(coding: Pick<VariableCodingData, 'id' | 'alias'>): string {
  return coding.alias || coding.id;
}
