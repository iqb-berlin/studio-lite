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
  dateTimeFormat = 'dd.MM.yyyy HH:mm';

  constructor(private translateService: TranslateService) {}

  setLocale(): void {
    this.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setDefaultOptions({ locale: de });
    this.translateService.use('de');
    registerLocaleData(localeDe);
  }
}
