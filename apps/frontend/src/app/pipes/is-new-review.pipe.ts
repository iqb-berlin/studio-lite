import { Pipe, PipeTransform } from '@angular/core';
import { differenceInCalendarDays } from 'date-fns';

/**
 * Whether a review was changed within the last three days, and is therefore marked as new. Compared
 * by calendar day, not by the hour: a review from yesterday evening is not older than one from this
 * morning, and a change of the clocks in between does not shift the count (#1896).
 */
@Pipe({
  name: 'isNewReview',
  standalone: true
})
export class IsNewReviewPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(date: Date): boolean {
    return differenceInCalendarDays(new Date(), new Date(date)) <= 3;
  }
}
