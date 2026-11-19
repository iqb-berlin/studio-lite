import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { DEFAULT_UI_LANGUAGE, UI_LANGUAGES } from '@studio-lite/shared-code';
import { UI_LOCALE_DATA } from './ui-locale-data';
import { compareTranslations, TranslationTexts } from '../utils/translation-check.utils';

/**
 * The translation files against the language list (#2174). A language is offered only when it is
 * complete -- every key of the German file, with the same placeholders -- so that no text appears as
 * its key and no `{{name}}` stays unfilled. German is the source every other file is translated from.
 *
 * Failing here after adding a text to `de.json`: add it to every other file as well; the failure
 * names the keys. How to translate is in TRANSLATION.md.
 */
describe('translation files', () => {
  const directory = join(__dirname, '../../assets/i18n');
  const read = (code: string): TranslationTexts => JSON.parse(readFileSync(join(directory, `${code}.json`), 'utf8'));
  const offered = UI_LANGUAGES.map(language => language.code);

  it('should have a file and locale data for every language offered, and offer every file', () => {
    const files = readdirSync(directory)
      .filter(file => file.endsWith('.json'))
      .map(file => file.replace(/\.json$/, ''));

    expect([...files].sort()).toEqual([...offered].sort());
    expect(offered.filter(code => !UI_LOCALE_DATA[code])).toEqual([]);
    expect(offered).toContain(DEFAULT_UI_LANGUAGE);
  });

  offered
    .filter(code => code !== DEFAULT_UI_LANGUAGE)
    .forEach(code => {
      it(`should translate every German text into ${code}, with the same placeholders and edge spaces`, () => {
        expect(compareTranslations(read(DEFAULT_UI_LANGUAGE), read(code)))
          .toEqual({
            missing: [], extra: [], placeholders: [], whitespace: []
          });
      });
    });
});
