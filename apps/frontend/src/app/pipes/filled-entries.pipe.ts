import { Pipe, PipeTransform } from '@angular/core';
import { MetadataValuesEntry } from '@studio-lite-lib/api-dto';
import { LanguageCodedText as TextWithLanguage } from '@iqbspecs/metadata-profile';

/**
 * Keeps only the metadata entries that actually carry a value. Unfilled profile keys are
 * intentionally hidden in the read-only metadata views: stored placeholder entries with empty
 * values (editor-saved units) must render exactly like absent entries (JSON-imported units).
 */
@Pipe({
  name: 'filledEntries',
  standalone: true
})
export class FilledEntriesPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(entries: MetadataValuesEntry[] | undefined | null): MetadataValuesEntry[] {
    return (entries ?? []).filter(entry => FilledEntriesPipe.hasDisplayableValue(entry?.valueAsText));
  }

  private static hasDisplayableValue(valueAsText?: TextWithLanguage | TextWithLanguage[]): boolean {
    if (Array.isArray(valueAsText)) {
      return valueAsText.some(text => !!text?.value?.trim());
    }
    return !!valueAsText?.value?.trim();
  }
}
