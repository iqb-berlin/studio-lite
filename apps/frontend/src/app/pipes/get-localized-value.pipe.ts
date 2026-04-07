import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'getLocalizedValue',
  standalone: true,
  pure: true
})
export class GetLocalizedValuePipe implements PipeTransform {
  constructor(private translateService: TranslateService) {}

  transform(values?: { lang: string; value: string }[] | null, defaultValue = ''): string {
    if (!values || values.length === 0) {
      return defaultValue;
    }
    const currentLang = this.translateService.currentLang;
    const localized = values.find(v => v.lang === currentLang) || values[0];
    return localized.value || defaultValue;
  }
}
