import { Injectable } from '@angular/core';
import { setDefaultOptions } from 'date-fns';
import { de } from 'date-fns/locale';
import { TranslateService } from '@ngx-translate/core';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  timeZone!: string;
  fileDateFormat = 'yyyy-MM-dd';
  fullLocale = 'de-DE';
  language = 'de';
  dateTimeFormat = 'dd.MM.yyyy HH:mm';
  dateFormat = 'dd.MM.yyyy';

  constructor(private translateService: TranslateService) {}

  setLocale(): void {
    this.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setDefaultOptions({ locale: de });
    this.translateService.use(this.language);
    registerLocaleData(localeDe);
  }
}
