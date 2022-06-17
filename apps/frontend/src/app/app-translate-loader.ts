import { TranslateLoader } from '@ngx-translate/core';
import { from, merge, Observable } from 'rxjs';
import { reduce } from 'rxjs/operators';

export class AppTranslateLoader implements TranslateLoader {
  getTranslation = (lang: string): Observable<Record<string, string>> => merge(
    from(import(`../assets/i18n/${lang}.json`)),
    from(import(`../../../api/src/assets/i18n/${lang}.json`))
  ).pipe(
    reduce((
      merged: Record<string, string>,
      file: Record<string, string>
    ): Record<string, string> => ({ ...merged, ...file }), {})
  );
}
