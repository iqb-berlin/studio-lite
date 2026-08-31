import { Pipe, PipeTransform } from '@angular/core';
import { MetadataResolver } from '@iqb/metadata-resolver';

type LabelText = string | Array<{ lang: string; value: string }>;

/**
 * The readable name of a metadata profile, whatever shape it arrives in: a plain string, a `label`,
 * or a `title` -- and each of those either as text or as a list of translations. Always through
 * `MetadataResolver.extractLabelText`, so a label is read the same way everywhere.
 */
@Pipe({
  name: 'profileLabel',
  standalone: true
})
export class ProfileLabelPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(value: unknown): string {
    if (!value) {
      return '';
    }
    if (typeof value === 'string') {
      return value;
    }
    if (typeof value === 'object') {
      const labelled = value as { label?: LabelText; title?: LabelText };
      if (labelled.label) {
        return MetadataResolver.extractLabelText(labelled.label);
      }
      if (labelled.title) {
        return MetadataResolver.extractLabelText(labelled.title);
      }
    }
    return '';
  }
}
