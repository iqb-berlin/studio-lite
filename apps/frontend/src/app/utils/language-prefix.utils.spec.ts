import { UiLanguage } from '@studio-lite/shared-code';
import { languageOfHash, splitLanguagePrefix } from './language-prefix.utils';

describe('splitLanguagePrefix', () => {
  const codes = ['de', 'en'];

  it.each([
    ['/en/a/5/12/editor', 'en', '/a/5/12/editor'],
    ['/en', 'en', '/'],
    ['/en/', 'en', '/'],
    ['/en?redirectTo=%2Fen%2Fa%2F5', 'en', '/?redirectTo=%2Fen%2Fa%2F5'],
    ['/en/a/5/12/(properties//secondary:preview)', 'en', '/a/5/12/(properties//secondary:preview)'],
    ['/de/a/5', 'de', '/a/5']
  ])('should take the prefix off %s', (url: string, code: string, rest: string) => {
    expect(splitLanguagePrefix(url, codes)).toEqual({ code, rest });
  });

  // A review link is a login name in the place of the prefix; a language not offered is no prefix;
  // and an address keeps what it was without one (#2174).
  it.each([
    ['/a/5/12/editor'],
    ['/3f2c9a1e-0b7d-4c1a-9e7f-2a6b5c4d3e21'],
    ['/fr/a/5'],
    ['/EN/a/5'],
    ['/english/a/5'],
    ['/'],
    ['']
  ])('should leave %s as it is', (url: string) => {
    expect(splitLanguagePrefix(url, codes)).toEqual({ rest: url });
  });
});

describe('languageOfHash', () => {
  const de = { code: 'de', name: 'Deutsch' } as UiLanguage;
  const en = { code: 'en', name: 'English' } as UiLanguage;

  it('should take the language the prefix names', () => {
    expect(languageOfHash('#/en/a/5', [de, en])).toBe(en);
  });

  it.each([
    ['without a prefix', '#/a/5', [de, en]],
    ['without any address', '', [de, en]],
    ['with a prefix of a language not offered', '#/en/a/5', [de]]
  ])('should take German %s', (_: string, hash: string, offered: UiLanguage[]) => {
    expect(languageOfHash(hash, offered)).toBe(de);
  });
});
