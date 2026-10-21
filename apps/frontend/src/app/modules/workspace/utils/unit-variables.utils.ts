import { UnitDefinitionDto, UnitSchemeDto } from '@studio-lite-lib/api-dto';
import { CodingSchemeData } from '@iqbspecs/coding-scheme/coding-scheme.interface';
import { VariableInfo } from '@iqbspecs/variable-info/variable-info.interface';
import { toVariableInfoV1 } from '@studio-lite/shared-code';
import { AliasId } from '../../metadata/models/alias-id.interface';

/**
 * The variables an item of the unit may refer to: those of the definition -- the editor's unsaved
 * list if there is one, else the stored one -- that carry a value, and those the coding scheme
 * derives from them. The schemer reports no derived variables of its own (the Verona field
 * `derivedVariables` stays empty), so they are read from the scheme's variable codings (#1361).
 *
 * Without a scheme there is nothing to tell, and the list is empty.
 */
export function unitVariables(
  definition: UnitDefinitionDto | undefined,
  scheme: UnitSchemeDto | undefined
): AliasId[] {
  if (!scheme) return [];
  const baseVariables: VariableInfo[] = definition?.variables || scheme.variables || [];
  // the list may be in the VariableInfo 1.x or 2.x spelling (#1708); read through shared-code, not
  // @iqb/responses, which would pull a megabyte into the initial bundle with this root service
  const variableAliasIds = baseVariables
    .filter(variable => toVariableInfoV1(variable).type !== 'no-value')
    .map(variable => ({ id: variable.id, alias: variable.alias || variable.id }));
  const codingScheme: CodingSchemeData = JSON.parse(scheme.scheme);
  const variableCodingIds = (codingScheme?.variableCodings || [])
    .filter(coding => coding.sourceType !== 'BASE_NO_VALUE')
    .filter(coding => !(
      coding.sourceType === 'BASE' && !variableAliasIds.find(aliasId => aliasId.id === coding.id)
    ))
    .map(coding => ({ id: coding.id, alias: coding.alias || coding.id }));
  return [...variableAliasIds, ...variableCodingIds]
    // merged without duplicates
    .reduce((merged: AliasId[], current: AliasId) => {
      if (!merged.find(aliasId => aliasId.id === current.id)) merged.push(current);
      return merged;
    }, [])
    .sort((a, b) => {
      const aliasA = a.alias.toUpperCase();
      const aliasB = b.alias.toUpperCase();
      if (aliasA < aliasB) return -1;
      if (aliasA > aliasB) return 1;
      return 0;
    });
}
