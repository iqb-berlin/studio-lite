import { Pipe, PipeTransform } from '@angular/core';
import { StringUtils } from '../../../classes/string-utils';

@Pipe({
  name: 'upperSnakeCaseToKebabCase',
  standalone: true
})
export class UpperSnakeCaseToKebabCasePipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(upperSnakeCaseString: string): string {
    if (!upperSnakeCaseString) return '';
    return StringUtils.upperSnakeCaseToKebabCase(upperSnakeCaseString);
  }
}
