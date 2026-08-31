import { Pipe, PipeTransform } from '@angular/core';
import { StringUtils } from '../../../classes/string-utils';

/**
 * Turns an UPPER_SNAKE_CASE constant into the kebab-case spelling the translation keys use, so a
 * value that arrives from the API can be looked up without a table mapping each one by hand.
 */
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
