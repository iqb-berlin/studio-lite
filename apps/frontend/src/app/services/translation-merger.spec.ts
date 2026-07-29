import {
  mergeTranslations,
  selectTranslationsForLanguage
} from './translation-merger';

describe('mergeTranslations', () => {
  it('keeps component-only and Studio-only translations', () => {
    expect(mergeTranslations(
      { componentOnly: 'component' },
      { studioOnly: 'studio' }
    )).toEqual({
      componentOnly: 'component',
      studioOnly: 'studio'
    });
  });

  it('deeply merges shared namespaces and lets Studio override collisions', () => {
    expect(mergeTranslations(
      {
        coding: {
          componentOnly: 'component',
          shared: 'component'
        }
      },
      {
        coding: {
          studioOnly: 'studio',
          shared: 'studio'
        }
      }
    )).toEqual({
      coding: {
        componentOnly: 'component',
        studioOnly: 'studio',
        shared: 'studio'
      }
    });
  });

  it('replaces scalar and array values instead of merging them', () => {
    expect(mergeTranslations(
      { scalar: { nested: 'component' }, list: ['component'] },
      { scalar: 'studio', list: ['studio'] }
    )).toEqual({
      scalar: 'studio',
      list: ['studio']
    });
  });
});

describe('selectTranslationsForLanguage', () => {
  const translations = {
    de: { label: 'Deutsch' },
    en: { label: 'English' }
  };

  it('selects the requested language and normalizes regional language tags', () => {
    expect(selectTranslationsForLanguage('en', translations)).toEqual({
      label: 'English'
    });
    expect(selectTranslationsForLanguage('de-DE', translations)).toEqual({
      label: 'Deutsch'
    });
  });

  it('uses the explicit fallback when the requested language is unavailable', () => {
    expect(selectTranslationsForLanguage('fr', translations, 'en')).toEqual({
      label: 'English'
    });
  });

  it('returns an empty map if neither requested nor fallback language exists', () => {
    expect(selectTranslationsForLanguage('fr', {}, 'de')).toEqual({});
  });
});
