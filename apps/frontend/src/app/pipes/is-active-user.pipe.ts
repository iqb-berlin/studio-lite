import { Pipe, PipeTransform } from '@angular/core';
import { AppService } from '../services/app.service';
import { ACTIVE_THRESHOLD_MS } from '../app.constants';

/**
 * Whether a user's last activity is recent enough to count as active. Measured against the server's
 * clock, not the browser's: a machine whose clock is off would otherwise mark everyone active or
 * nobody.
 */
@Pipe({
  name: 'isActiveUser',
  standalone: true
})
export class IsActiveUserPipe implements PipeTransform {
  constructor(private appService: AppService) {}

  transform(lastActivity: string | Date | undefined): boolean {
    if (!lastActivity) return false;
    const activeThreshold = this.appService.getServerTime() - ACTIVE_THRESHOLD_MS;
    return new Date(lastActivity).getTime() > activeThreshold;
  }
}
