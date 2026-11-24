import { inject, Pipe, PipeTransform } from '@angular/core';
import { MetadataValuesEntry } from '@studio-lite-lib/api-dto';
import { LanguageService } from '../services/language.service';
import { valueTextsIn } from '../utils/metadata-language.utils';

/** The display texts of a metadata field in the language of the interface (#2207). */
@Pipe({
  name: 'metadataValueTexts',
  standalone: true,
  pure: true
})
export class MetadataValueTextsPipe implements PipeTransform {
  private readonly language = inject(LanguageService).active.code;

  transform(entry: Pick<MetadataValuesEntry, 'value' | 'valueAsText'>): { lang: string; value: string }[] {
    return valueTextsIn(entry, this.language);
  }
}
