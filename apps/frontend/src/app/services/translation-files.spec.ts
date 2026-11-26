import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { DEFAULT_UI_LANGUAGE, UI_LANGUAGES } from '@studio-lite/shared-code';
import { mergeTranslations, NGX_CODING_COMPONENTS_DE_TRANSLATIONS } from '@iqb/ngx-coding-components/translations';
import { UI_LOCALE_DATA } from './ui-locale-data';
import { compareTranslations, missingTranslationKeys, TranslationTexts } from '../utils/translation-check.utils';

/**
 * The translation files against the language list (#2174). A language is offered only when it is
 * complete -- every key of the German file, with the same placeholders -- so that no text appears as
 * its key and no `{{name}}` stays unfilled. German is the source every other file is translated from.
 *
 * Failing here after adding a text to `de.json`: add it to every other file as well; the failure
 * names the keys. How to translate is in TRANSLATION.md. Failing at the keys the code names: the text
 * is in no file yet, add it to all of them (#2231).
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

  // A key the code names but no file holds shows as the key itself (#2231). The texts of the coding components
  // come in as translation-loader.ts mixes them in. The components of libs/iqb-components take their texts from
  // these files as well (#2237).
  it('should hold every key that a template or a component names in quotes', () => {
    const sources = [join(__dirname, '..'), join(__dirname, '../../../../../libs/iqb-components/src')]
      .flatMap(sourceDirectory => readdirSync(sourceDirectory, { recursive: true, encoding: 'utf8' })
        .filter(file => /\.(html|ts)$/.test(file) && !file.endsWith('.spec.ts'))
        .map(file => readFileSync(join(sourceDirectory, file), 'utf8')));
    const german = mergeTranslations(
      NGX_CODING_COMPONENTS_DE_TRANSLATIONS,
      read(DEFAULT_UI_LANGUAGE)
    ) as TranslationTexts;

    expect(missingTranslationKeys(german, sources)).toEqual([]);
  });
});
