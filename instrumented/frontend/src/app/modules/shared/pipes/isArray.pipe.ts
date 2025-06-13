import { Pipe, PipeTransform } from '@angular/core';

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
