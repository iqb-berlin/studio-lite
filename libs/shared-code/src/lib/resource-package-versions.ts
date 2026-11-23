import { RESOURCE_PACKAGE_ENDING } from './unit-dependencies';

/**
 * Versions of a resource package side by side (#1358). A unit names a package by the name its
 * modules know (`GeoGebra.itcr.zip`), and they ask for the folder of that name (`GeoGebra/…`).
 * Every installed package carries a package name, the name it stands in for; which of the
 * packages of one package name (`GeoGebra-5.0.791`, `GeoGebra-5.3`) serves a workspace is decided
 * by the studio alone: the one its workspace group chose, else the default an administrator set,
 * else the package installed under exactly that name -- which is how it was before there were
 * versions. A name nothing stands in for is still served by the package installed under it, as a
 * module may ask for one by its own name (the IB player takes it from the unit definition).
 *
 * Names are compared regardless of case, as the testcenter compares them (#1602). Where two
 * packages differ in case only, the one spelt exactly as asked wins.
 */

/** A package (its installed name) per package name: `{ GeoGebra: 'GeoGebra-5.0.791' }`. */
export type ResourcePackageChoice = Record<string, string>;

/** An installed package as the resolution needs it. */
export interface InstalledResourcePackage {
  /** The name it is installed under, without the ending -- also the folder it is unpacked in. */
  name: string;
  /** The name it stands in for, the one units give. */
  packageName: string;
}

/** A workspace group with the packages it chose, as far as the resolution needs it. */
export interface ResourcePackageGroup {
  id: number;
  name: string;
  chosenResourcePackages?: ResourcePackageChoice;
}

/**
 * Where the package a name resolves to comes from: the group's choice, the default, the package of
 * exactly that name among those standing in for it, or -- nothing standing in for the name -- the
 * package installed under it, whatever it stands in for.
 */
export type ResourcePackageSource = 'group' | 'default' | 'name' | 'file';

export interface ResolvedResourcePackage {
  /** The installed name of the package, spelt as it is installed. */
  name: string;
  source: ResourcePackageSource;
}

/** How a workspace group resolves a package name: to which package, and why; `null` when to none. */
export interface GroupResolution {
  group: ResourcePackageGroup;
  resolved: ResolvedResourcePackage | null;
}

/** Why a package may not be deleted or given another package name. */
export interface ResourcePackageUse {
  /** It is the default of its package name. */
  isDefault: boolean;
  /** The groups that chose it. */
  groups: ResourcePackageGroup[];
  /** No default is set, and it serves its package name as the package of exactly that name. */
  servesByName: boolean;
}

/** The name a file name gives a package: `GeoGebra.itcr.zip` is `GeoGebra`. */
export function resourcePackageNameOf(fileName: string): string {
  return fileName.toLowerCase().endsWith(RESOURCE_PACKAGE_ENDING) ?
    fileName.slice(0, -RESOURCE_PACKAGE_ENDING.length) :
    fileName;
}

/**
 * The package name to suggest for an uploaded file: its name up to the first hyphen followed by a
 * digit, so that `GeoGebra-5.0.791.itcr.zip` stands in for `GeoGebra`; a name without such a
 * version, `avatar.itcr.zip`, stands in for itself. Only a suggestion: the administrator decides.
 */
export function suggestPackageName(fileName: string): string {
  const name = resourcePackageNameOf(fileName);
  return /^(.+?)-\d/.exec(name)?.[1] ?? name;
}

function sameName(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}

/** The entry of that name: spelt exactly so, else regardless of case. */
function findByName<T>(name: string, entries: T[], nameOf: (entry: T) => string): T | undefined {
  return entries.find(entry => nameOf(entry) === name) ??
    entries.find(entry => sameName(nameOf(entry), name));
}

/** The installed packages that stand in for a package name. */
export function resourcePackagesFor(
  packageName: string,
  installed: InstalledResourcePackage[]
): InstalledResourcePackage[] {
  return installed.filter(resourcePackage => sameName(resourcePackage.packageName, packageName));
}

/** The package a choice names for a package name, if it is one of the candidates for that name. */
function chosenFrom(
  packageName: string,
  choice: ResourcePackageChoice | undefined,
  candidates: InstalledResourcePackage[]
): InstalledResourcePackage | undefined {
  if (!choice) return undefined;
  const key = findByName(packageName, Object.keys(choice), entry => entry);
  const chosen = key === undefined ? undefined : choice[key];
  return typeof chosen === 'string' ? findByName(chosen, candidates, candidate => candidate.name) : undefined;
}

/**
 * The installed package that serves a package name (`GeoGebra`): among the packages standing in for
 * it, the one the group chose, else the default, else the one installed under exactly that name;
 * with none standing in for it, the package installed under the name. A choice or a default that
 * names none of them is passed over. Null when nothing serves the name.
 */
export function resolveResourcePackage(
  packageName: string,
  installed: InstalledResourcePackage[],
  groupChoice?: ResourcePackageChoice,
  defaults?: ResourcePackageChoice
): ResolvedResourcePackage | null {
  const candidates = resourcePackagesFor(packageName, installed);
  const resolved: [InstalledResourcePackage | undefined, ResourcePackageSource][] = [
    [chosenFrom(packageName, groupChoice, candidates), 'group'],
    [chosenFrom(packageName, defaults, candidates), 'default'],
    [findByName(packageName, candidates, candidate => candidate.name), 'name'],
    [candidates.length ? undefined : findByName(packageName, installed, candidate => candidate.name), 'file']
  ];
  const [found, source] = resolved.find(([candidate]) => candidate !== undefined) ?? [];
  return found && source ? { name: found.name, source } : null;
}

/**
 * The choice with the given package for a package name, or without an entry for it when no package
 * is given -- an entry spelt otherwise is replaced, as names are compared regardless of case.
 */
export function withChosenResourcePackage(
  choice: ResourcePackageChoice | undefined,
  packageName: string,
  name?: string
): ResourcePackageChoice {
  const others = Object.entries(choice ?? {})
    .filter(([key]) => !sameName(key, packageName));
  return { ...Object.fromEntries(others), ...(name ? { [packageName]: name } : {}) };
}

/**
 * How each group resolves a package name. What an administrator is shown before a change: a
 * default set anew reaches every group that has not chosen a package of its own, and a package
 * overwritten reaches every group it resolves to.
 */
export function resolveResourcePackageForGroups(
  packageName: string,
  installed: InstalledResourcePackage[],
  groups: ResourcePackageGroup[],
  defaults?: ResourcePackageChoice
): GroupResolution[] {
  return groups.map(group => ({
    group,
    resolved: resolveResourcePackage(packageName, installed, group.chosenResourcePackages, defaults)
  }));
}

/**
 * Whether a package is in use, so that deleting it or giving it another package name would leave
 * a choice or the default pointing at nothing, or the name served by none of the packages that
 * remain for it: it is the default, a group chose it, or it serves the name without a default set
 * -- and there are other packages of its package name. The only package of its name is not in
 * use: what it served is then served by nothing, as when a package is deleted today.
 */
export function resourcePackageInUse(
  resourcePackage: InstalledResourcePackage,
  installed: InstalledResourcePackage[],
  groups: ResourcePackageGroup[],
  defaults?: ResourcePackageChoice
): ResourcePackageUse | null {
  const candidates = resourcePackagesFor(resourcePackage.packageName, installed);
  const isIt = (candidate: InstalledResourcePackage | undefined): boolean => candidate?.name === resourcePackage.name;
  if (!candidates.some(candidate => !isIt(candidate))) return null;
  const defaultPackage = chosenFrom(resourcePackage.packageName, defaults, candidates);
  const use: ResourcePackageUse = {
    isDefault: isIt(defaultPackage),
    groups: groups.filter(group => isIt(chosenFrom(
      resourcePackage.packageName, group.chosenResourcePackages, candidates
    ))),
    servesByName: !defaultPackage &&
      isIt(findByName(resourcePackage.packageName, candidates, candidate => candidate.name))
  };
  return use.isDefault || use.groups.length || use.servesByName ? use : null;
}
