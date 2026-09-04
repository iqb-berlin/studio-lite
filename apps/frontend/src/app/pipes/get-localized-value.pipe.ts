import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

/**
 * Picks the text in the user's language out of a list of translations, falling back to the first
 * one there is -- a label in the wrong language reads better than no label.
 */
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
