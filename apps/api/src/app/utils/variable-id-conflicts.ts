import { VariableIdConflictDto, VariableIdConflictVariableDto } from '@studio-lite-lib/api-dto';
import { derivedVariableId, parseDerivedCodings } from './derived-codings';

/**
 * The ids the export would write for more than one variable. Both formats write base variables
 * under their internal id and derived ones under {@link derivedVariableId} -- two names that the
 * editor and the schemer keep unique each in its own list, but that the export puts into one
 * (#2119). A derived alias equal to the hidden internal id of an element is therefore valid in the
 * unit, and still rejected by the Testcenter in the XML and ambiguous in the JSON.
 */
export function findVariableIdConflicts(
  variables: { id: string; alias?: string }[] | null | undefined,
  scheme: string | null | undefined
): VariableIdConflictDto[] {
  const written: VariableIdConflictVariableDto[] = [
    ...(variables ?? []).map(variable => ({
      kind: 'base' as const,
      id: variable.id,
      ...(variable.alias && { alias: variable.alias })
    })),
    ...parseDerivedCodings({ scheme: scheme ?? '', schemeType: '' }).map(coding => ({
      kind: 'derived' as const,
      id: coding.id,
      ...(coding.alias && { alias: coding.alias })
    }))
  ];
  const byWrittenId = new Map<string, VariableIdConflictVariableDto[]>();
  written.forEach(variable => {
    const writtenId = variable.kind === 'base' ? variable.id : derivedVariableId(variable);
    byWrittenId.set(writtenId, [...(byWrittenId.get(writtenId) ?? []), variable]);
  });
  return [...byWrittenId.entries()]
    .filter(([, sharing]) => sharing.length > 1)
    .map(([id, sharing]) => ({ id, variables: sharing }));
}
