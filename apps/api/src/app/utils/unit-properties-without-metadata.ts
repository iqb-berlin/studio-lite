import { UnitPropertiesDto } from '@studio-lite-lib/api-dto';

/**
 * A unit's properties as a review shows them with its "show metadata" setting off (#1784): what the
 * review needs to play the unit and to name it, and the ids of the unit's items, by which comments
 * show which items they are about. Description, transcript, reference, the metadata profiles of
 * the unit and its items, and who changed what when are left out.
 *
 * It names what stays rather than what goes, so a field added to the properties later is not
 * handed out here before someone decides it should be.
 */
export function unitPropertiesWithoutMetadata(properties: UnitPropertiesDto): UnitPropertiesDto {
  const {
    id, uuid, key, name, state, groupName, player, editor, schemer, schemeType, metadata
  } = properties;
  return {
    id,
    uuid,
    key,
    name,
    state,
    groupName,
    player,
    editor,
    schemer,
    schemeType,
    metadata: { items: (metadata?.items ?? []).map(item => ({ uuid: item.uuid, id: item.id })) }
  };
}
