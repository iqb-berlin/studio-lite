// eslint-disable-next-line max-classes-per-file
export interface TextWithLanguage {
  'lang': string,
  'value': string
}
export class ProfileEntryParametersVocabulary {
  readonly url: string;
  readonly allowMultipleValues: boolean;
  readonly maxLevel: number;
  readonly hideNumbering: boolean;
  readonly hideTitle: boolean;
  readonly hideDescription: boolean;
  readonly addTextLanguages: string[];

  constructor(profileEntryParameters: any) {
    this.url = profileEntryParameters['url'] || '?url';
    this.allowMultipleValues = profileEntryParameters['allowMultipleValues'] || false;
    this.maxLevel = profileEntryParameters['maxLevel'] || 0;
    this.hideNumbering = profileEntryParameters['hideNumbering'] || false;
    this.hideTitle = profileEntryParameters['hideTitle'] || false;
    this.hideDescription = profileEntryParameters['hideDescription'] || false;
    this.addTextLanguages = profileEntryParameters['addTextLanguages'] || [];
  }
}

export class ProfileEntryParametersText {
  readonly format: string;
  readonly textLanguages: string[];
  readonly pattern: string;

  constructor(profileEntryParameters: any) {
    this.format = profileEntryParameters['format'] || '';
    this.pattern = profileEntryParameters['pattern'] || '';
    this.textLanguages = profileEntryParameters['textLanguages'] || [];
  }
}

export class ProfileEntryParametersNumber {
  readonly digits: number;
  readonly minValue: number | null;
  readonly maxValue: number | null;
  readonly isPeriodSeconds: boolean;

  constructor(profileEntryParameters: any) {
    this.digits = profileEntryParameters['digits'] || 0;
    if (profileEntryParameters['minValue'] === null) {
      this.minValue = null;
    } else {
      this.minValue = profileEntryParameters['minValue'];
    }
    if (profileEntryParameters['maxValue'] === null) {
      this.maxValue = null;
    } else {
      this.maxValue = profileEntryParameters['maxValue'];
    }
    this.isPeriodSeconds = profileEntryParameters['isPeriodSeconds'] || false;
  }
}

export class ProfileEntryParametersBoolean {
  readonly trueLabel: string;
  readonly falseLabel: string;
  constructor(profileEntryParameters: any) {
    this.trueLabel = MDProfile.getTextFromTextWithLanguage(profileEntryParameters['trueLabel']);
    this.falseLabel = MDProfile.getTextFromTextWithLanguage(profileEntryParameters['falseLabel']);
  }
}

export class MDProfileEntry {
  readonly id: string;
  readonly label: string;
  readonly type: string;
  readonly parameters: ProfileEntryParametersNumber | ProfileEntryParametersBoolean |
    ProfileEntryParametersText | ProfileEntryParametersVocabulary | null;
  constructor(entryData: any) {
    this.id = entryData['id'] || '';
    this.label = MDProfile.getTextFromTextWithLanguage(entryData['label']);
    this.type = entryData['type'] || '';
    this.parameters = null;
    if (entryData['parameters']) {
      if (this.type === 'number') {
        this.parameters = new ProfileEntryParametersNumber(entryData['parameters']);
      } else if (this.type === 'text') {
        this.parameters = new ProfileEntryParametersText(entryData['parameters']);
      } else if (this.type === 'boolean') {
        this.parameters = new ProfileEntryParametersBoolean(entryData['parameters']);
      } else if (this.type === 'vocabulary') {
        this.parameters = new ProfileEntryParametersVocabulary(entryData['parameters']);
      }
    }
  }
}

export class MDProfileGroup {
  readonly label: string;
  readonly entries: MDProfileEntry[];
  constructor(groupData: any) {
    this.label = MDProfile.getTextFromTextWithLanguage(groupData['label']);
    this.entries = [];
    if (groupData['entries']) {
      const entryArray: any[] = groupData['entries'];
      entryArray.forEach(e => {
        this.entries.push(new MDProfileEntry(e));
      })
    }
  }
}

export class MDProfile {
  static lang = "de";
  readonly id: string;
  readonly label: string;
  readonly groups: MDProfileGroup[];
  constructor(profileData: any) {
    this.id = profileData['id'] || null;
    this.label = MDProfile.getTextFromTextWithLanguage(profileData['label']);
    this.groups = [];
    if (profileData['groups']) {
      const groupArray: any[] = profileData['groups'];
      groupArray.forEach(g => {
        this.groups.push(new MDProfileGroup(g));
      })
    }
  }

  static getTextFromTextWithLanguage(langArray: any | null): string {
    if (langArray) {
      const langArrayTyped: TextWithLanguage[] = langArray;
      const textEntry = langArrayTyped.find(t => t.lang === MDProfile.lang);
      if (textEntry) return textEntry['value'] || '';
      if (langArrayTyped.length > 0) {
        return langArrayTyped[0]['value'] || '';
      }
    }
    return '';
  }
}
