import { VeronaModuleClass } from '../models/verona-module.class';

/**
 * The installed widget that answers a player's call for a widget type: of the widgets whose model is that
 * type, the first in the list, and of that widget its newest version (#2225).
 *
 * Each minor version of a widget is installed as a module of its own, and the API lists the versions of
 * a widget oldest first. Taking the first match therefore opened the old version as long as it was
 * still installed beside the new one. Between different widgets of the same type the list order still
 * decides, as before.
 *
 * The version is compared by `sortKey`, which pads every number, so that 1.10 comes after 1.9. Like the
 * module list, it puts a pre-release after the release it belongs to.
 */
export function widgetForType(widgets: VeronaModuleClass[], widgetType: string): VeronaModuleClass | undefined {
  const ofType = widgets.filter(widget => widget.metadata.model === widgetType);
  if (ofType.length === 0) return undefined;
  const { id } = ofType[0].metadata;
  return ofType
    .filter(widget => widget.metadata.id === id)
    .reduce((newest, widget) => (widget.sortKey > newest.sortKey ? widget : newest));
}
