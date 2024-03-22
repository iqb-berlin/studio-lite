import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'include',
  standalone: true
})
export class IncludePipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform<T>(array: T[], value: T): boolean {
    return array.includes(value);
  }
}
