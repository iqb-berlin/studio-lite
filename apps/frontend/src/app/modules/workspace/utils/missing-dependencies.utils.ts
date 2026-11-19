import { isResourcePackageName, namesResourcePackage, UnitDependency } from '@studio-lite/shared-code';

/** What a unit needs to be played that the studio does not have, by kind. */
export interface MissingDependencies {
  packages: string[];
  widgets: string[];
  files: string[];
}

/**
 * What of the given dependencies the studio lacks: a resource package not installed under that
 * name, compared regardless of case as the testcenter does; a widget type no installed widget
 * declares as its `model` -- the same lookup the preview makes when the player calls a widget; and
 * any other file, since the studio hands the modules nothing but its installed packages.
 *
 * A service the studio cannot check, so it is never missing here: unknown is not missing (#1602).
 */
export function findMissingDependencies(
  dependencies: UnitDependency[] | undefined,
  installedPackageNames: string[],
  installedWidgetModels: string[]
): MissingDependencies {
  const missing: MissingDependencies = { packages: [], widgets: [], files: [] };
  (dependencies ?? []).forEach(dependency => {
    if (dependency.type === 'WIDGET') {
      if (!installedWidgetModels.includes(dependency.id)) missing.widgets.push(dependency.id);
    } else if (dependency.type === 'SERVICE') {
      // nothing to check against
    } else if (!isResourcePackageName(dependency.id)) {
      missing.files.push(dependency.id);
    } else if (!installedPackageNames.some(name => namesResourcePackage(dependency.id, name))) {
      missing.packages.push(dependency.id);
    }
  });
  return missing;
}
