export class VeronaModuleFactory {
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

  static isValid(key: string, lookupList: string[]): boolean | string {
    if (lookupList.indexOf(key) >= 0) return true;
    const bestMatch = this.getBestMatch(key, lookupList);
    return bestMatch || false;
  }
}
