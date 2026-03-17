import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cast',
  standalone: true
})
export class CastPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-unused-vars
  transform<S, T extends S>(value: S, type: T): T {
    return <T>value;
  }
}
