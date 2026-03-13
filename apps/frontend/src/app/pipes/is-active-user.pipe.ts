import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'isActiveUser',
  standalone: true
})
export class IsActiveUserPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(lastActivity: Date | string | undefined | null, thresholdMs = 900000): boolean {
    if (!lastActivity) return false;
    const date = new Date(lastActivity);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    // Allow for 2 minutes future skew (server ahead)
    // and show as active if less than threshold
    return diff < thresholdMs && diff > -120000;
  }
}
