import { derivedVariableId, parseDerivedCodings } from './coding-scheme';

/** One of the variables behind an id that the export would write twice. */
export interface VariableIdConflictVariable {
  /** base: from the unit definition, written under its internal id; derived: from the coding scheme */
  kind: 'base' | 'derived';
  id: string;
  alias?: string;
}

/** An id that the export would write for more than one variable (#2119). */
export interface VariableIdConflict {
  id: string;
  variables: VariableIdConflictVariable[];
}

/**
 * The ids the export would write for more than one variable. Both formats write base variables
 * under their internal id and derived ones under {@link derivedVariableId} -- two names that the
 * editor and the schemer keep unique each in its own list, but that the export puts into one
 * (#2119). A derived alias equal to the hidden internal id of an element is therefore valid in the
 * unit, and still rejected by the Testcenter in the XML and ambiguous in the JSON.
 *
 * The export dialog asks it of the saved unit, the unit check of the unit as it is being edited
 * (#2135); both ask here, so that they cannot drift apart.
 */
export function findVariableIdConflicts(
  variables: { id: string; alias?: string }[] | null | undefined,
  scheme: string | null | undefined
): VariableIdConflict[] {
  const written: VariableIdConflictVariable[] = [
    ...(variables ?? []).map(variable => ({
      kind: 'base' as const,
      id: variable.id,
      ...(variable.alias && { alias: variable.alias })
    })),
    ...parseDerivedCodings(scheme).map(coding => ({
      kind: 'derived' as const,
      id: coding.id,
      ...(coding.alias && { alias: coding.alias })
    }))
  ];
  const byWrittenId = new Map<string, VariableIdConflictVariable[]>();
  written.forEach(variable => {
    const writtenId = variable.kind === 'base' ? variable.id : derivedVariableId(variable);
    byWrittenId.set(writtenId, [...(byWrittenId.get(writtenId) ?? []), variable]);
  });
  return [...byWrittenId.entries()]
    .filter(([, sharing]) => sharing.length > 1)
    .map(([id, sharing]) => ({ id, variables: sharing }));
}
