import { NGX_CODING_COMPONENTS_DE_TRANSLATIONS } from '@iqb/ngx-coding-components/translations';
import { mergeTranslations, TranslationMap } from './translation-merger';

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

  it('merges the published Coding Components translations with Studio overrides', () => {
    const merged = mergeTranslations(
      NGX_CODING_COMPONENTS_DE_TRANSLATIONS,
      {
        coding: {
          'raw-responses': 'Rohdaten anzeigen',
          'studio-only': 'Studio'
        }
      }
    );
    const coding = (merged as {
      coding: TranslationMap & { transformed: unknown };
    }).coding;

    expect(coding.transformed).toBe('Transformiert');
    expect(coding['studio-only']).toBe('Studio');
    expect(coding['raw-responses']).toBe('Rohdaten anzeigen');
  });
});
