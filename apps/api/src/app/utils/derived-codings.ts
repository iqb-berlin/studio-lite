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
