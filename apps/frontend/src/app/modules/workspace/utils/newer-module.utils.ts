import { compareText, VeronaModuleKeyCollection } from '@studio-lite/shared-code';
import { matchDefinitionType } from './definition-type-match.utils';

/**
 * What is asked of an installed version of a module. The fields are those of `VeronaModuleClass`; a
 * version without them never counts as newer.
 */
export interface ModuleVersion {
  nameAndVersion: string;
  /**
   * When the version was installed. `VeronaModuleClass` types it a number, but the API sends the date
   * as text (ISO); a module listed without one has 0.
   */
  fileDateTime?: number | string;
  metadata?: { model?: string; isStable?: boolean; version?: string };
}

/** A newer version of a module than the unit is opened with, and worth knowing of (#2199). */
export interface NewerModule {
  /** The version the unit is opened with, by name and version, as the module selection shows it */
  used: string;
  /** The newest such version, named the same way */
  newer: string;
  /**
   * For an editor whose content the unit's player is not known to read: that player, and the version of it
   * that does -- to be updated together with the editor.
   */
  player?: { used: string; newer: string };
}

/** What is asked for one module of a unit. */
export interface NewerModuleQuery {
  /** The key the unit is opened with: its own, or the later minor version that stands in for it */
  usedKey: string;
  /** The installed versions of this kind of module, by key */
  installed: Record<string, ModuleVersion>;
  /** The format the module reads: of the unit's definition, or of its coding scheme */
  format: string | undefined;
  /** When the part the module reads was last saved */
  lastChanged: Date | undefined;
  /**
   * Only for an editor, whose content the unit's player has to read: the key of that player, empty
   * where it has none installed, and the installed players.
   */
  players?: { usedKey: string; installed: Record<string, ModuleVersion> };
  /**
   * For the schemer: there is no other, and each version carries on the one before it on the same
   * responses. A version that declares nothing fits as well; one that declares not to read the scheme
   * still does not.
   */
  successive?: boolean;
}

// the module a key names, as the studio picks a version by it (`id@major.minor`)
const MODULE_KEY = /^([A-Za-z\d_-]+)@\d/;
const UPPER_BOUND = /^<=(\d+(?:\.\d+){0,2})$/;

function moduleOf(key: string): string | undefined {
  return MODULE_KEY.exec(key)?.[1];
}

/** Whether a key names a later version, in the order the studio lists modules in. */
function isLater(key: string, than: string): boolean {
  return compareText(VeronaModuleKeyCollection.getSortKey(key), VeronaModuleKeyCollection.getSortKey(than)) > 0;
}

/** The numbers of a version, without a pre-release suffix. */
function versionNumbers(version: string | undefined): number[] | undefined {
  const match = /^(\d+)\.(\d+)\.(\d+)/.exec(version ?? '');
  return match ? match.slice(1).map(Number) : undefined;
}

/**
 * Whether a stable version is newer than the one in use: later in the studio's order, or -- where a
 * pre-release is in use -- its release or a later patch of it, which the studio lists before it.
 */
function isNewer(key: string, version: ModuleVersion, usedKey: string, used: ModuleVersion): boolean {
  if (isLater(key, usedKey)) return true;
  const numbers = versionNumbers(version.metadata?.version);
  const usedNumbers = versionNumbers(used.metadata?.version);
  if (used.metadata?.isStable !== false || !numbers || !usedNumbers) return false;
  return (numbers.map((part, i) => part - usedNumbers[i]).find(diff => diff !== 0) ?? 0) >= 0;
}

/** When a version was installed, in milliseconds; undefined without a date -- 0 is none, not 1970. */
function installedAt(version: ModuleVersion): number | undefined {
  if (!version.fileDateTime) return undefined;
  const time = new Date(version.fileDateTime).getTime();
  return Number.isNaN(time) ? undefined : time;
}

/**
 * Whether a module declares that it reads a format. Only a declaration counts: a module without a `model`,
 * or a unit without a format, is not taken to fit -- old aspect modules (before 3.0), Stars, Speedtest and
 * Abi declare none, and nothing can tell which of their versions read what.
 */
const reads = (format: string | undefined, version: ModuleVersion | undefined): boolean => (
  matchDefinitionType(format, version?.metadata?.model) === 'compatible');

/**
 * Whether a newer version reads the unit's format: as it declares it -- or, for the schemer, unless it
 * declares not to.
 */
function readsUnit(version: ModuleVersion, query: NewerModuleQuery): boolean {
  const match = matchDefinitionType(query.format, version.metadata?.model);
  return match === 'compatible' || (match === 'unknown' && !!query.successive);
}

/**
 * The format an editor writes: the upper end of the formats it declares (`aspect-unit-definition@>=4.0
 * <=4.13` writes 4.13), as the aspect editor builds its metadata. No specification says what the `model`
 * of an editor names; where it does not end in one upper bound written `<=`, what it writes is not known.
 */
export function writtenFormat(model: string | undefined): string | undefined {
  const at = model?.indexOf('@') ?? -1;
  if (!model || at <= 0) return undefined;
  const range = model.slice(at + 1);
  if (range.includes('||')) return undefined;
  const upperBounds = range
    .replace(/(>=|<=|>|<|=)\s+/g, '$1')
    .trim()
    .split(/\s+/)
    .filter(comparator => comparator.startsWith('<'));
  const upper = upperBounds.length === 1 ? UPPER_BOUND.exec(upperBounds[0]) : null;
  return upper ? `${model.slice(0, at).trim()}@${upper[1]}` : undefined;
}

/** The newest stable version of a module newer than the one a key names that passes a test. */
function newestStableAfter(
  key: string,
  installed: Record<string, ModuleVersion>,
  passes: (version: ModuleVersion) => boolean
): ModuleVersion | undefined {
  const module = moduleOf(key);
  const used = installed[key];
  if (!used) return undefined;
  const newest = Object.keys(installed)
    .filter(candidate => moduleOf(candidate) === module && !!installed[candidate].metadata?.isStable &&
      isNewer(candidate, installed[candidate], key, used) && passes(installed[candidate]))
    .reduce((last, candidate) => (!last || isLater(candidate, last) ? candidate : last), '');
  return newest ? installed[newest] : undefined;
}

/**
 * Whether a newer version fits the unit, as far as the metadata show it -- undefined where they do not.
 * A player or a schemer reads the unit's format (see {@link readsUnit}). An editor reads it too, and what
 * it writes is read by the unit's player -- or by a newer version of that player, which is then to be
 * updated with it. Editor and player versions of a module family need not match (aspect before 3.0): only
 * the formats are compared.
 */
function fit(version: ModuleVersion, query: NewerModuleQuery): { player?: ModuleVersion } | undefined {
  if (!readsUnit(version, query)) return undefined;
  if (!query.players) return {};
  const written = writtenFormat(version.metadata?.model);
  if (!written) return undefined;
  const { usedKey, installed } = query.players;
  if (reads(written, installed[usedKey])) return {};
  const player = usedKey ? newestStableAfter(usedKey, installed, candidate => reads(written, candidate)) : undefined;
  return player && { player };
}

/**
 * The newest installed version of a module that is later than the one the unit is opened with, stable,
 * and fits the unit -- named only where the unit was saved with the older version after the first of them
 * was installed (#2199), that is, while the unit is still being worked on. Saved: what is still being
 * edited is not yet written with any version. A unit last saved before stays as it is; it was made with the
 * module it names.
 */
export function newerModule(query: NewerModuleQuery): NewerModule | undefined {
  const used = query.installed[query.usedKey];
  const usedModule = moduleOf(query.usedKey);
  const lastChanged = query.lastChanged?.getTime();
  if (!used || !usedModule || lastChanged === undefined) return undefined;
  const passing = Object.entries(query.installed).flatMap(([key, version]) => {
    const installed = installedAt(version);
    if (installed === undefined || moduleOf(key) !== usedModule || !version.metadata?.isStable ||
      !isNewer(key, version, query.usedKey, used)) return [];
    const fitting = fit(version, query);
    return fitting ? [{
      key, version, installed, player: fitting.player
    }] : [];
  });
  if (!passing.length || lastChanged <= Math.min(...passing.map(entry => entry.installed))) return undefined;
  const newest = passing.reduce((last, entry) => (isLater(entry.key, last.key) ? entry : last));
  const usedPlayer = query.players?.installed[query.players.usedKey];
  return {
    used: used.nameAndVersion,
    newer: newest.version.nameAndVersion,
    ...(newest.player && usedPlayer && {
      player: { used: usedPlayer.nameAndVersion, newer: newest.player.nameAndVersion }
    })
  };
}
