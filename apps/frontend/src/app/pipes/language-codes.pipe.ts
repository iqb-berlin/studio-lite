import { Pipe, PipeTransform } from '@angular/core';

/** Language codes as one text, `de, en`; nothing for none. */
@Pipe({
  name: 'languageCodes',
  standalone: true
})
export class LanguageCodesPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(codes: string[] | null | undefined): string {
    return (codes ?? []).join(', ');
  }
}
