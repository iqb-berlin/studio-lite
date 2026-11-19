/**
 * What a unit needs beside its player or editor: a resource package such as GeoGebra, a widget, a
 * service. The editor reports it with the definition (`dependenciesToPlay`, `dependenciesToEdit`,
 * editor API 4.0 on), and the studio stores it, exports it and warns when a package is missing (#1602).
 *
 * The types are those of editor API 5.0 plus `SERVICE`: 4.x knew only `file` and `service`, in lower
 * case, and is still read. `file` names a resource package when the name ends in `.itcr.zip` -- the
 * studio and the testcenter unpack every such file -- and becomes `FILE_TO_UNPACK` then.
 */
export const UNIT_DEPENDENCY_TYPES = [
  'FILE', 'FILE_TO_UNPACK', 'STREAM', 'STREAM_TO_UNPACK', 'WIDGET', 'SERVICE'
] as const;

export type UnitDependencyType = typeof UNIT_DEPENDENCY_TYPES[number];

export interface UnitDependency {
  id: string;
  type: UnitDependencyType;
}

/** The file ending of a resource package, as studio and testcenter recognize one. */
export const RESOURCE_PACKAGE_ENDING = '.itcr.zip';

/** Whether a file name names a resource package, regardless of case. */
export function isResourcePackageName(fileName: string): boolean {
  return fileName.toLowerCase().endsWith(RESOURCE_PACKAGE_ENDING);
}

/**
 * Whether a file name a unit gives names the installed package of that name: the package's name
 * with the ending, compared regardless of case, as the testcenter compares it.
 */
export function namesResourcePackage(fileName: string, packageName: string): boolean {
  return fileName.toLowerCase() === `${packageName}${RESOURCE_PACKAGE_ENDING}`.toLowerCase();
}

/** A file entry: a resource package is unpacked, any other file is not. */
export function fileDependencyType(fileName: string): UnitDependencyType {
  return isResourcePackageName(fileName) ? 'FILE_TO_UNPACK' : 'FILE';
}

function toUnitDependency(entry: unknown): UnitDependency | null {
  if (!entry || typeof entry !== 'object') return null;
  const { id: rawId, type } = entry as { id?: unknown; type?: unknown };
  if (typeof rawId !== 'string' || typeof type !== 'string') return null;
  // a name is compared with installed packages and widgets, so the spaces around it go
  const id = rawId.trim();
  if (!id) return null;
  // editor API 4.x
  if (type === 'file') return { id, type: fileDependencyType(id) };
  if (type === 'service') return { id, type: 'SERVICE' };
  return (UNIT_DEPENDENCY_TYPES as readonly string[]).includes(type) ?
    { id, type: type as UnitDependencyType } :
    null;
}

/**
 * A dependency list as the studio keeps it: what an editor or a file reports, with every entry left
 * out that names nothing or a type no specification knows, and every repeated entry once.
 */
export function toUnitDependencies(raw: unknown): UnitDependency[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map(toUnitDependency)
    .filter((dependency): dependency is UnitDependency => dependency !== null)
    .filter((dependency, index, list) => list
      .findIndex(other => other.id === dependency.id && other.type === dependency.type) === index);
}

const key = (dependency: UnitDependency): string => `${dependency.type}\u0000${dependency.id}`;

/**
 * Whether two lists name the same dependencies, regardless of order: an editor may report them in
 * any order, and a unit would otherwise count as changed after every report. A missing list is the
 * same as an empty one -- both say there are none.
 */
export function sameDependencyLists(
  a: UnitDependency[] | null | undefined,
  b: UnitDependency[] | null | undefined
): boolean {
  const keysA = (a ?? []).map(key).sort();
  const keysB = (b ?? []).map(key).sort();
  return keysA.length === keysB.length && keysA.every((value, index) => value === keysB[index]);
}
