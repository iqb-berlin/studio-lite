/**
 * A list of installed Verona module keys (`name@major.minor…`) and the questions asked of it:
 * is this module there, what may stand in for it, in which order are they shown.
 *
 * The keys are copied in the constructor, so the collection keeps answering the same way while
 * the caller's list changes underneath it.
 */
export class VeronaModuleKeyCollection {
  /** The installed keys, in the order they were handed in. */
  moduleKeys: string[] = [];
  /** Takes a copy of the keys handed in; see the note on the class. */
  constructor(moduleKeys: string[]) {
    this.moduleKeys = [...moduleKeys];
  }

  /** Whether exactly this key is installed — no version substitution. */
  isInList(key: string): boolean {
    return this.moduleKeys.indexOf(key) >= 0;
  }

  /**
   * The installed key that may stand in for `key`: the exact one if it is there, otherwise the
   * one with the same name and major version and the highest minor version above the requested
   * one. Never an earlier minor version and never another major version. Empty when nothing
   * qualifies, including when the key does not parse as a module key at all.
   */
  getBestMatch(key: string): string {
    if (this.isInList(key)) return key;
    const regexPattern = /^([A-Za-z\d_-]+)@(\d+)\.(\d+)/;
    const matches1 = regexPattern.exec(key);
    if (!matches1 || matches1.length !== 4) return '';
    let bestMatchId = '';
    let bestMatchMinor = +matches1[3];
    this.moduleKeys.forEach(k => {
      const matches2 = regexPattern.exec(k);
      if (matches2 && matches2.length === 4) {
        if ((matches2[1] === matches1[1]) && (matches2[2] === matches1[2])) {
          const minor = +matches2[3];
          if (minor > bestMatchMinor) {
            bestMatchMinor = minor;
            bestMatchId = k;
          }
        }
      }
    });
    if (bestMatchId) return bestMatchId;
    return '';
  }

  /**
   * `true` when the key itself is installed, the substituting key when only a later minor version
   * is, `false` when neither. The three cases are distinguished by type on purpose: a caller has
   * to notice that it is about to use a module other than the one asked for.
   */
  isValid(key: string): boolean | string {
    if (this.isInList(key)) return true;
    const bestMatch = this.getBestMatch(key);
    return bestMatch || false;
  }

  /** Whether any module is installed at all — the case a chooser has to offer nothing for. */
  hasEntries(): boolean {
    return this.moduleKeys.length > 0;
  }

  /**
   * The string a key sorts by. Every number is padded to a fixed width so that plain string
   * comparison orders them numerically -- otherwise `@1.10` would sort before `@1.9`.
   *
   * The patch level is part of it. It used to reach the sort key only through the pre-release
   * pattern below, which does not match a plain release: `x@2.8.1` and `x@2.8.2` produced the same
   * key, and {@link getSorted}, which uses it as a lookup key, dropped one of the two.
   *
   * A pre-release keeps sorting after the release it belongs to, as it did before. That is not the
   * semver order, but it is the order this collection has always had.
   *
   * A key that does not parse as a module key sorts as itself.
   */
  static getSortKey(key: string): string {
    const versionPattern = /^([A-Za-z\d_-]+)@(\d+)\.(\d+)(?:\.(\d+))?/;
    const preReleasePattern = /(\d+)-([a-z-]+)\.?(\d*)$/;
    const version = versionPattern.exec(key);
    if (!version) return key;
    const [, name, major, minor, patch] = version;
    const sortString = `${name}@${major.padStart(20, '0')}.${
      minor.padStart(20, '0')}.${(patch || '0').padStart(20, '0')}`;
    const preRelease = preReleasePattern.exec(key);
    if (preRelease) {
      return `${sortString}-${preRelease[2]}.${(preRelease[3] || '0').padStart(20, '0')}`;
    }
    return sortString;
  }

  /**
   * The keys ordered by name and version, newest last. Built over a lookup keyed by
   * {@link getSortKey}, so two keys with the same sort key would collapse into one -- which is why
   * that key carries the patch level: without it `x@2.8.1` and `x@2.8.2` shared one and only the
   * last of them survived. Nothing calls this at present.
   */
  getSorted(): string[] {
    const newList: { [key: string]: string } = {};
    this.moduleKeys.forEach(key => {
      newList[VeronaModuleKeyCollection.getSortKey(key)] = key;
    });
    const newKeys = Object.keys(newList).sort();
    return newKeys.map(key => newList[key]);
  }
}
