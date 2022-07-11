export class VeronaModuleKeyCollection {
  moduleKeys: string[] = [];
  constructor(moduleKeys: string[]) {
    this.moduleKeys = [...moduleKeys];
  }

  isInList(key: string): boolean {
    return this.moduleKeys.indexOf(key) >= 0;
  }

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

  isValid(key: string): boolean | string {
    if (this.isInList(key)) return true;
    const bestMatch = this.getBestMatch(key);
    return bestMatch || false;
  }

  hasEntries(): boolean {
    return this.moduleKeys.length > 0;
  }

  static getSortKey(key: string): string {
    const regexPattern1 = /^([A-Za-z\d_-]+)@(\d+)\.(\d+)/;
    const regexPatternSuffix = /(\d+)-([a-z]+)(\d+)$/;
    const matches1 = regexPattern1.exec(key);
    if (matches1 && matches1.length === 4) {
      const sortString = `${matches1[1]}@${matches1[2].padStart(20, '0')}.${matches1[3].padStart(20, '0')}`;
      const matchesSuffix = regexPatternSuffix.exec(key);
      if (matchesSuffix && matchesSuffix.length === 4) {
        return `${sortString}.${matchesSuffix[1].padStart(20, '0')}-${matchesSuffix[2]}${matchesSuffix[3].padStart(20, '0')}`;
      }
      return sortString;
    }
    return key;
  }

  getSorted(): string[] {
    const newList: { [key: string]: string } = {};
    this.moduleKeys.forEach(key => {
      newList[VeronaModuleKeyCollection.getSortKey(key)] = key;
    });
    const newKeys = Object.keys(newList).sort();
    return newKeys.map(key => newList[key]);
  }
}
