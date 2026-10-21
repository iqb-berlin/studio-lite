import { HttpClient } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import {
  NGX_CODING_COMPONENTS_DE_TRANSLATIONS,
  mergeTranslations,
  selectTranslationsForLanguage,
  TranslationMap
} from '@iqb/ngx-coding-components/translations';
import { map } from 'rxjs';

// eslint-disable-next-line no-bitwise
const hash = (str: string) => str.split('').reduce((prev, curr) => Math.imul(31, prev) + curr.charCodeAt(0) | 0, 0);

const componentTranslations: Record<string, TranslationMap> = {
  de: NGX_CODING_COMPONENTS_DE_TRANSLATIONS
};

export function createTranslateLoader(http: HttpClient): TranslateLoader {
  const studioLoader = new TranslateHttpLoader(http, './assets/i18n/', `.json?v=${Math
    .abs(hash(new Date().toISOString()))}`);

  return {
    getTranslation: (language: string) => studioLoader.getTranslation(language)
      .pipe(map(studioTranslations => mergeTranslations(
        selectTranslationsForLanguage(language, componentTranslations),
        studioTranslations as TranslationMap
      )))
  };
}
