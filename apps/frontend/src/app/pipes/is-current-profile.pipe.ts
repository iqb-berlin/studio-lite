import { Pipe, PipeTransform } from '@angular/core';
import { isCurrentFromOrder } from '@studio-lite/shared-code';

/**
 * Whether a metadata profile is the current one, read off its `order` -- see `profile-order.ts`,
 * which replaced the boolean this pipe used to be given.
 */
@Pipe({
  name: 'isCurrentProfile',
  standalone: true
})
export class IsCurrentProfilePipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(order: number | null | undefined): boolean {
    return isCurrentFromOrder(order);
  }
}
