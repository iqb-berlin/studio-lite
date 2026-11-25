import { VeronaModuleKeyCollection } from '@studio-lite/shared-code';
import { VeronaModuleClass } from '../models/verona-module.class';
import { widgetForType } from './widget-for-type.utils';

describe('widgetForType', () => {
  // A widget as the API lists it: the key carries major and minor version, the sort key comes from it
  const widget = (key: string, model: string): VeronaModuleClass => ({
    key,
    sortKey: VeronaModuleKeyCollection.getSortKey(key),
    metadata: { id: key.split('@')[0], model }
  }) as VeronaModuleClass;

  // The API lists the versions of a widget oldest first, and the first match was the old one (#2225)
  it('should take the newest version of a widget installed in two', () => {
    const older = widget('periodic-table@1.9', 'PERIODIC_TABLE');
    const newer = widget('periodic-table@1.10', 'PERIODIC_TABLE');

    expect(widgetForType([older, newer], 'PERIODIC_TABLE')).toBe(newer);
  });

  it('should keep to the first of two widgets of the same type, in its newest version', () => {
    const first = widget('calculator@1.0', 'CALC');
    const firstNewer = widget('calculator@1.2', 'CALC');
    const other = widget('pocket-calc@2.0', 'CALC');

    expect(widgetForType([first, firstNewer, other], 'CALC')).toBe(firstNewer);
  });

  it('should find no widget when none has the type called for', () => {
    expect(widgetForType([widget('calculator@1.0', 'CALC')], 'MOLECULE_EDITOR')).toBeUndefined();
  });
});
