import { Pipe, PipeTransform } from '@angular/core';
import { isCurrentFromOrder } from '@studio-lite/shared-code';

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
