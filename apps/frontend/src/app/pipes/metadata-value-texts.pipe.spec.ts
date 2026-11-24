import { TestBed } from '@angular/core/testing';
import { LanguageService } from '../services/language.service';
import { MetadataValueTextsPipe } from './metadata-value-texts.pipe';

describe('MetadataValueTextsPipe', () => {
  it('chooses the texts in the language of the interface (#2207)', () => {
    TestBed.configureTestingModule({
      providers: [MetadataValueTextsPipe, { provide: LanguageService, useValue: { active: { code: 'en' } } }]
    });

    const texts = TestBed.inject(MetadataValueTextsPipe).transform({
      value: [{ id: 'dt/3' }],
      valueAsText: [{ lang: 'de', value: 'Umfragedaten' }, { lang: 'en', value: 'Survey data' }]
    });

    expect(texts).toEqual([{ lang: 'en', value: 'Survey data' }]);
  });
});
