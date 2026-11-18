import { registerLocaleData } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { getDefaultOptions, setDefaultOptions } from 'date-fns';
import { de } from 'date-fns/locale';
import { UiLanguage } from '@studio-lite/shared-code';
import { I18nService } from './i18n.service';
import { LanguageService } from './language.service';
import { UI_LOCALE_DATA } from './ui-locale-data';

describe('I18nService', () => {
  // German by code, so that its locale data exist; the formats are made up, so that only the
  // language can have supplied them.
  const active = {
    code: 'de',
    name: 'Deutsch',
    locale: 'de-XX',
    dateFormat: 'D',
    dateTimeFormat: 'D T',
    shortDateTimeFormat: 'd t'
  } as UiLanguage;

  let service: I18nService;
  let use: jest.Mock;

  beforeEach(() => {
    use = jest.fn();
    setDefaultOptions({});
    document.documentElement.lang = 'xx';
    TestBed.configureTestingModule({
      providers: [
        { provide: LanguageService, useValue: { active } },
        { provide: TranslateService, useValue: { use } }
      ]
    });
    service = TestBed.inject(I18nService);
  });

  it('should take the locale and the formats from the language of the address (#2175)', () => {
    expect(service.fullLocale).toBe('de-XX');
    expect(service.dateFormat).toBe('D');
    expect(service.dateTimeFormat).toBe('D T');
    expect(service.shortDateTimeFormat).toBe('d t');
  });

  it('should set translations, date libraries and the page language to that language (#2175)', () => {
    service.setLocale();

    expect(use).toHaveBeenCalledWith('de');
    expect((getDefaultOptions() as { locale?: unknown }).locale).toBe(de);
    expect(registerLocaleData).toHaveBeenCalledWith(UI_LOCALE_DATA[active.code].angular);
    expect(document.documentElement.lang).toBe('de');
  });
});
