import { DEFAULT_UI_LANGUAGE, UiLanguage } from '@studio-lite/shared-code';

/**
 * Takes the language prefix off a router url: `/en/a/5` → `en` and `/a/5`. Only the codes given count,
 * and only as written there, so a login name or a review link (`/3f2c…`) is never taken for one,
 * and neither is a language that is not offered (#2174).
 */
export function splitLanguagePrefix(url: string, codes: readonly string[]): { code?: string; rest: string } {
  const match = /^\/?([^/?#(]+)(.*)$/s.exec(url);
  if (!match || !codes.includes(match[1])) return { rest: url };
  const rest = match[2];
  if (rest.startsWith('/')) return { code: match[1], rest };
  return { code: match[1], rest: `/${rest}` };
}

/**
 * The language a page address asks for: the one its prefix names, the default language without a
 * prefix or with one that is not offered.
 */
export function languageOfHash(hash: string, languages: readonly UiLanguage[]): UiLanguage {
  const { code } = splitLanguagePrefix(hash.replace(/^#/, ''), languages.map(language => language.code));
  return languages.find(language => language.code === (code ?? DEFAULT_UI_LANGUAGE)) ?? languages[0];
}
