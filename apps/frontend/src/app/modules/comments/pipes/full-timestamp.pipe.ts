import { Pipe, PipeTransform } from '@angular/core';
import { format } from 'date-fns';

/** The full date and time of a comment, for the tooltip behind the relative time. */
@Pipe({
  name: 'fullTimestamp',
  standalone: true
})
export class FullTimestampPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(date: Date): string {
    return format(new Date(date), 'PPP - HH:mm');
  }
}
