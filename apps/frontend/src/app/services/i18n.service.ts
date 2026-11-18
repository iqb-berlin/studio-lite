import { DOCUMENT, registerLocaleData } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { setDefaultOptions } from 'date-fns';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from './language.service';
import { UI_LOCALE_DATA } from './ui-locale-data';

/**
 * The locale the studio runs in, in one place: language, time zone and the date formats everything
 * else formats by. They follow the language of the address (see `LanguageService`); the browser's
 * own language plays no part.
 */
@Injectable({
  providedIn: 'root'
})
export class I18nService {
  private translateService = inject(TranslateService);
  private document = inject(DOCUMENT);
  private readonly language = inject(LanguageService).active;

  timeZone!: string;
  fileDateFormat = 'yyyy-MM-dd';
  fullLocale = this.language.locale;
  dateTimeFormat = this.language.dateTimeFormat;
  dateFormat = this.language.dateFormat;
  shortDateTimeFormat = this.language.shortDateTimeFormat;

  setLocale(): void {
    const localeData = UI_LOCALE_DATA[this.language.code];
    this.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setDefaultOptions({ locale: localeData.dateFns });
    this.translateService.use(this.language.code);
    registerLocaleData(localeData.angular);
    this.document.documentElement.lang = this.language.code;
  }
}
