import { Pipe, PipeTransform } from '@angular/core';

/**
 * Whether an array contains a value. A pipe because `array.includes(x)` written in a template runs
 * on every change-detection cycle, which the project's rules forbid.
 */
@Pipe({
  name: 'include',
  standalone: true
})
export class IncludePipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform<T>(array: T[] | undefined, value: T): boolean {
    return array?.includes(value) || false;
  }
}
