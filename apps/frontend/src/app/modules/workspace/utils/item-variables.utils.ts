import { UnitMetadataValues } from '@studio-lite-lib/api-dto';
import { AliasId } from '../../metadata/models/alias-id.interface';

type ItemVariable = { variableId?: string | null, variableReadOnlyId?: string | null };

/**
 * Brings an item's variable in line with the unit's variables: an alias renamed since is taken
 * over, and an assignment to a variable that no longer exists is removed. It is the rule
 * `ItemComponent` applies while the properties are open; on saving it applies whether they were
 * opened or not (#1361).
 *
 * The item names its variable by id (`variableReadOnlyId`) and shows it by alias (`variableId`);
 * metadata from before the id was kept names it by `variableId` alone.
 */
export function reconcileItemVariable(item: ItemVariable, variables: AliasId[]): ItemVariable {
  const variableReadOnlyId = item.variableReadOnlyId || item.variableId;
  const alias = variableReadOnlyId ?
    variables.find(variable => variable.id === variableReadOnlyId)?.alias :
    undefined;
  if (alias) return { variableReadOnlyId, variableId: alias };
  if (item.variableId) return { variableReadOnlyId: null, variableId: null };
  return { variableReadOnlyId: item.variableReadOnlyId, variableId: item.variableId };
}

/**
 * The unit's metadata with its items' variables reconciled, or null when no alias changed and no
 * assignment went. Older metadata that only lacks the id is left as it is, so that saving does not
 * rewrite every such unit.
 */
export function reconcileItemVariables(
  metadata: UnitMetadataValues,
  variables: AliasId[]
): UnitMetadataValues | null {
  let changed = false;
  const items = (metadata.items || []).map(item => {
    const reconciled = reconcileItemVariable(item, variables);
    if (reconciled.variableId === item.variableId) return item;
    changed = true;
    return { ...item, ...reconciled };
  });
  return changed ? { ...metadata, items } : null;
}
