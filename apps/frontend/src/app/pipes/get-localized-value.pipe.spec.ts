import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { GetLocalizedValuePipe } from './get-localized-value.pipe';

describe('GetLocalizedValuePipe', () => {
  let pipe: GetLocalizedValuePipe;
  let translateServiceMock: Partial<TranslateService>;

  beforeEach(() => {
    translateServiceMock = {
      currentLang: 'de'
    };

    TestBed.configureTestingModule({
      providers: [
        GetLocalizedValuePipe,
        { provide: TranslateService, useValue: translateServiceMock }
      ]
    });

    pipe = TestBed.inject(GetLocalizedValuePipe);
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return default value if values is null or empty', () => {
    expect(pipe.transform(null, 'default')).toBe('default');
    expect(pipe.transform([], 'default')).toBe('default');
  });

  it('should return localized value for current language', () => {
    const values = [
      { lang: 'en', value: 'Hello' },
      { lang: 'de', value: 'Hallo' }
    ];
    expect(pipe.transform(values)).toBe('Hallo');
  });

  it('should return first value if current language is not found', () => {
    translateServiceMock.currentLang = 'fr';
    const values = [
      { lang: 'en', value: 'Hello' },
      { lang: 'de', value: 'Hallo' }
    ];
    expect(pipe.transform(values)).toBe('Hello');
  });
});
