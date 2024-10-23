import { Pipe, PipeTransform } from '@angular/core';
import { formatDistanceToNow } from 'date-fns';

@Pipe({
  name: 'fromNow',
  standalone: true
})
export class FromNowPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(date: Date): string {
    return formatDistanceToNow(new Date(date));
  }
}
