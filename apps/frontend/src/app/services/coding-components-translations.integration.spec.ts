import { NGX_CODING_COMPONENTS_DE_TRANSLATIONS } from '@iqb/ngx-coding-components/translations';
import { TranslationMap } from './translation-merger';

describe('Coding Components translation entry point', () => {
  it('exports the German Coding Components translations', () => {
    const coding = (NGX_CODING_COMPONENTS_DE_TRANSLATIONS as {
      coding: TranslationMap & { transformed: unknown };
    }).coding;

    expect(coding.transformed).toBe('Transformiert');
  });
});
