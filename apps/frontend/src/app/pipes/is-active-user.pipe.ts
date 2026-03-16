import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'isActiveUser',
  standalone: true
})
export class IsActiveUserPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(lastActivity: string | Date | undefined, thresholdMs = 1800000): boolean {
    if (!lastActivity) return false;
    const lastActivityDate = new Date(lastActivity);
    const now = new Date();
    return (now.getTime() - lastActivityDate.getTime()) < thresholdMs;
  }
}
