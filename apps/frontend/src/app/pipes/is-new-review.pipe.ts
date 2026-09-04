import { Pipe, PipeTransform } from '@angular/core';

/**
 * Whether a review was created within the last three days, and is therefore marked as new. Compared
 * by day, not by the hour: a review from yesterday evening is not older than one from this morning.
 */
@Pipe({
  name: 'isNewReview',
  standalone: true
})
export class IsNewReviewPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(date: Date): boolean {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);
    const diffInMs = now.getTime() - target.getTime();
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
    return diffInDays <= 3;
  }
}
