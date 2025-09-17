import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'isNewReview',
  standalone: true
})
export class IsNewReviewPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(date: Date): boolean {
    const now = new Date();
    const diffInMs = now.getTime() - new Date(date).getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInHours / 24;
    return diffInDays <= 3;
  }
}
