import {
  fileDependencyType, toUnitDependencies, UnitDependency
} from '@studio-lite/shared-code';
import { ExportReportScope } from '../classes/export-report.class';
import { UnitIndexDependency } from '../interfaces/unit-json-specs.interface';

/**
 * The dependency lists of a unit (#1602) in the two export formats and back.
 *
 * Unit XML (unit-xml 17.7) knows a file and a service, each `for` the module that needs it, but no
 * type: every file becomes `<File>`, a widget is left out -- the testcenter checks widgets through
 * the booklet. Read back, a file named like a resource package is one to unpack.
 *
 * unit-index 18.1 knows a file with its delivery and a widget by its type, but no service.
 */

/** Which module a list is for, in the lower-case spelling of the unit XSD. */
export type UnitXmlDependencyTarget = 'player' | 'editor';

export interface UnitXmlDependency {
  element: 'File' | 'Service';
  target: UnitXmlDependencyTarget;
  name: string;
}

export interface UnitDependencyLists {
  dependenciesToPlay: UnitDependency[];
  dependenciesToEdit: UnitDependency[];
}

const UNIT_INDEX_WIDGET_PATTERN = /^[A-Z_]+$/;

function toUnitXmlEntries(list: UnitDependency[], target: UnitXmlDependencyTarget): UnitXmlDependency[] {
  return list
    .filter(dependency => dependency.type !== 'WIDGET')
    .map(dependency => ({
      element: dependency.type === 'SERVICE' ? 'Service' : 'File',
      target,
      name: dependency.id
    }));
}

/** The `<Dependencies>` entries of a unit XML, those to play first. */
export function toUnitXmlDependencies(lists: Partial<UnitDependencyLists>): UnitXmlDependency[] {
  return [
    ...toUnitXmlEntries(lists.dependenciesToPlay ?? [], 'player'),
    ...toUnitXmlEntries(lists.dependenciesToEdit ?? [], 'editor')
  ];
}

/**
 * The lists from the `<Dependencies>` of a unit XML. An entry without `for` is for the player, as
 * the XSD has it; entries for the schemer or the coder have no list in the studio and are left out.
 */
export function fromUnitXmlDependencies(
  entries: { element: string; target?: string; name: string }[]
): UnitDependencyLists {
  const listFor = (target: UnitXmlDependencyTarget) => toUnitDependencies(entries
    .filter(entry => (entry.target || 'player') === target)
    .map(entry => {
      const id = entry.name.trim();
      return entry.element.toLowerCase() === 'service' ?
        { id, type: 'SERVICE' } :
        { id, type: fileDependencyType(id) };
    }));
  return { dependenciesToPlay: listFor('player'), dependenciesToEdit: listFor('editor') };
}

/**
 * A list as unit-index writes it. What it cannot hold -- a service, a widget type outside its
 * pattern -- is left out and reported.
 */
export function toUnitIndexDependencies(
  list: UnitDependency[] | undefined,
  scope?: ExportReportScope
): UnitIndexDependency[] {
  return (list ?? []).flatMap((dependency): UnitIndexDependency[] => {
    if (dependency.type === 'SERVICE' ||
      (dependency.type === 'WIDGET' && !UNIT_INDEX_WIDGET_PATTERN.test(dependency.id))) {
      scope?.report('dropped-content.dependency-not-exported', { id: dependency.id, type: dependency.type });
      return [];
    }
    if (dependency.type === 'WIDGET') return [dependency.id];
    return [{
      fileName: dependency.id,
      ...(dependency.type.endsWith('_TO_UNPACK') && { unpackBeforeProviding: true }),
      ...(dependency.type.startsWith('STREAM') && { httpResponseMode: 'STREAM' as const })
    }];
  });
}

/** A list from unit-index; what does not fit its shape is left out. */
export function fromUnitIndexDependencies(list: unknown): UnitDependency[] {
  if (!Array.isArray(list)) return [];
  return toUnitDependencies(list.map(entry => {
    if (typeof entry === 'string') return { id: entry, type: 'WIDGET' };
    if (!entry || typeof entry !== 'object') return null;
    const { fileName, unpackBeforeProviding, httpResponseMode } = entry as Record<string, unknown>;
    const delivery = httpResponseMode === 'STREAM' ? 'STREAM' : 'FILE';
    return {
      id: fileName,
      type: unpackBeforeProviding === true ? `${delivery}_TO_UNPACK` : delivery
    };
  }));
}
