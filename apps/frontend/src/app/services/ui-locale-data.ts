import { Locale } from 'date-fns';
import { de } from 'date-fns/locale';
import localeDe from '@angular/common/locales/de';

/**
 * What the libraries need to format dates in a language: date-fns's locale (relative times,
 * `PPP`, the date picker) and Angular's locale data (the date pipe). Every language in
 * `UI_LANGUAGES` needs an entry here; the translation-files spec checks that.
 */
export const UI_LOCALE_DATA: Record<string, { dateFns: Locale; angular: unknown[] }> = {
  de: { dateFns: de, angular: localeDe }
};
