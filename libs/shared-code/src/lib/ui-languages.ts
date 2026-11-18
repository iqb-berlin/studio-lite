/**
 * A language the studio's interface is offered in, with what the interface formats by in it.
 * Content -- units, metadata, comments -- keeps the language it was entered in; this is only the
 * language of the interface around it (#2174).
 */
export interface UiLanguage {
  /** Lower-case code as it stands in the address (`#/en/…`) and names `assets/i18n/<code>.json`. */
  code: string;
  /** The language's own name, as the language menu lists it. */
  name: string;
  /** Locale for Angular's date pipe, e.g. `de-DE`. */
  locale: string;
  dateFormat: string;
  dateTimeFormat: string;
  /** Date and time without the year, for lists of recent moments. */
  shortDateTimeFormat: string;
}

export const DEFAULT_UI_LANGUAGE = 'de';

/**
 * The languages the interface is offered in, in the order the language menu lists them. A language
 * goes in only with a complete translation file: the frontend's translation-files spec fails for one
 * whose keys or placeholders differ from `de.json` (#2174). The first entry is the default.
 */
export const UI_LANGUAGES: readonly UiLanguage[] = [
  {
    code: DEFAULT_UI_LANGUAGE,
    name: 'Deutsch',
    locale: 'de-DE',
    dateFormat: 'dd.MM.yyyy',
    dateTimeFormat: 'dd.MM.yyyy HH:mm',
    shortDateTimeFormat: 'dd.MM., HH:mm'
  }
];
