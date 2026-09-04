import { Pipe, PipeTransform } from '@angular/core';

/**
 * Whether an export would contain any test takers at all -- the three kinds (review, hot, monitor)
 * added up. What the login section of the export dialog is enabled by.
 */
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
