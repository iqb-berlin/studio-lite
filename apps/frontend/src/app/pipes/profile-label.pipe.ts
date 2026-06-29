import { Pipe, PipeTransform } from '@angular/core';
import { MetadataResolver } from '@iqb/metadata-resolver';

@Pipe({
  name: 'profileLabel',
  standalone: true
})
export class ProfileLabelPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(value: any): string {
    if (!value) {
      return '';
    }
    if (typeof value === 'string') {
      return value;
    }
    if (typeof value === 'object') {
      if ('label' in value && value.label) {
        return MetadataResolver.extractLabelText(value.label);
      }
      if ('title' in value && value.title) {
        return MetadataResolver.extractLabelText(value.title);
      }
    }
    return '';
  }
}
