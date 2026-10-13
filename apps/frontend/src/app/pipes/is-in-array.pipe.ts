import { Pipe, PipeTransform } from '@angular/core';

/** Whether an id is among the given ones -- {@link IncludePipe} for the common case of numbers. */
@Pipe({
  name: 'isInArray',
  standalone: true
})
export class IsInArrayPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(value: number, array: number[]): boolean {
    return array.includes(value);
  }
}
