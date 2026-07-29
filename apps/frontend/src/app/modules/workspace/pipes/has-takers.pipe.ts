import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'hasTakers',
  standalone: true
})
export class HasTakersPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(review: number, hot: number, monitor: number): boolean {
    return review + hot + monitor > 0;
  }
}
