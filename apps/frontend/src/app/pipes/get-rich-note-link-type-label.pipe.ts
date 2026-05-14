import { Pipe, PipeTransform } from '@angular/core';
import { StringUtils } from '../classes/string-utils';

@Pipe({
  name: 'getRichNoteLinkTypeLabel',
  standalone: true,
  pure: true
})
export class GetRichNoteLinkTypeLabelPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(type: string | undefined): string {
    if (!type) return '';
    return `rich-note.link-type-values.${StringUtils.upperSnakeCaseToKebabCase(type)}`;
  }
}
