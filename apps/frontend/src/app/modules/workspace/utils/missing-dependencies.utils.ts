import { isResourcePackageName, namesResourcePackage, UnitDependency } from '@studio-lite/shared-code';

/** What the studio has of what units need besides their modules (#1602). */
export interface InstalledDependencies {
  /** The names of the resource packages the workspace finds served. */
  packages: string[];
  /** The widget types installed widgets declare as their `model`. */
  widgets: string[];
}

/** What a unit needs to be played that the studio does not have, by kind. */
export interface MissingDependencies {
  packages: string[];
  widgets: string[];
  files: string[];
}

/**
 * What a dependency is to the studio: a resource package, a widget, a service, or any other file.
 * A file counts as a package by its name, whatever type it is given -- as the studio and the
 * testcenter unpack every file of that ending.
 */
export type DependencyKind = 'package' | 'widget' | 'file' | 'service';

/**
 * Whether the studio has what a unit needs: a package or widget is installed or missing, or unknown
 * where what is installed could not be read; another file the studio never provides; a service it
 * cannot check.
 */
export type DependencyState = 'installed' | 'missing' | 'unknown' | 'not-provided' | 'not-checked';

export interface CheckedDependency {
  id: string;
  kind: DependencyKind;
  state: DependencyState;
}

/**
 * Whether the studio has a dependency (#1602, #2198): a resource package installed under that name,
 * compared regardless of case as the testcenter does; a widget type an installed widget declares as
 * its `model` -- the same lookup the preview makes when the player calls a widget. Any other file the
 * studio does not have, since it hands the modules nothing but its installed packages. A service
 * it cannot check: unknown is not missing.
 */
export function checkDependency(
  dependency: UnitDependency,
  installed: InstalledDependencies | null
): CheckedDependency {
  const checked = (kind: DependencyKind, state: DependencyState): CheckedDependency => ({
    id: dependency.id, kind, state
  });
  if (dependency.type === 'SERVICE') return checked('service', 'not-checked');
  if (dependency.type === 'WIDGET') {
    if (!installed) return checked('widget', 'unknown');
    return checked('widget', installed.widgets.includes(dependency.id) ? 'installed' : 'missing');
  }
  if (!isResourcePackageName(dependency.id)) return checked('file', 'not-provided');
  if (!installed) return checked('package', 'unknown');
  return checked(
    'package',
    installed.packages.some(name => namesResourcePackage(dependency.id, name)) ? 'installed' : 'missing'
  );
}

/** What of the given dependencies the studio lacks, see {@link checkDependency}. */
export function findMissingDependencies(
  dependencies: UnitDependency[] | undefined,
  installed: InstalledDependencies
): MissingDependencies {
  const missing: MissingDependencies = { packages: [], widgets: [], files: [] };
  (dependencies ?? []).map(dependency => checkDependency(dependency, installed)).forEach(({ id, kind, state }) => {
    if (kind === 'package' && state === 'missing') missing.packages.push(id);
    if (kind === 'widget' && state === 'missing') missing.widgets.push(id);
    if (kind === 'file') missing.files.push(id);
  });
  return missing;
}
