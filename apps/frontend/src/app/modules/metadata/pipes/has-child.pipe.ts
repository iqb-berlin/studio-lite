import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'hasChild'
})
export class HasChildPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(value: number, array: number[]): boolean {
    return array.includes(value);
  }
}
