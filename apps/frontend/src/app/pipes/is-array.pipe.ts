import { Pipe, PipeTransform } from '@angular/core';

/**
 * Whether a value is an array; anything falsy is not. Metadata values arrive either as one value or
 * as a list of them, and the template has to tell the two apart before it can render either.
 */
@Pipe({
  name: 'isArray',
  standalone: true
})
export class IsArrayPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(value: unknown): boolean {
    if (!value) return false;
    return Array.isArray(value);
  }
}
