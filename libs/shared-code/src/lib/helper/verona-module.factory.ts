/**
 * Resolves a Verona module key (`name@major.minor…`) against a list of keys that are actually
 * installed. The static counterpart of {@link VeronaModuleKeyCollection}, for callers that hold
 * their list of keys elsewhere and only want to look one up.
 */
export class VeronaModuleFactory {
  /**
   * The installed key that may stand in for `key`: the exact one if it is there, otherwise the
   * one with the same name and major version and the highest minor version above the requested
   * one. A module may be replaced by a later minor version of itself, never by an earlier one and
   * never across a major version. Returns an empty string when nothing qualifies.
   */
  static getBestMatch(key: string, lookupList: string[]): string {
    if (lookupList.indexOf(key) >= 0) return key;
    const regexPattern = /^([A-Za-z\d_-]+)@(\d+)\.(\d+)/;
    const matches1 = regexPattern.exec(key);
    if (!matches1 || matches1.length !== 4) return '';
    let bestMatchId = '';
    let bestMatchMinor = +matches1[3];
    lookupList.forEach(k => {
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
  static isValid(key: string, lookupList: string[]): boolean | string {
    if (lookupList.indexOf(key) >= 0) return true;
    const bestMatch = this.getBestMatch(key, lookupList);
    return bestMatch || false;
  }
}
