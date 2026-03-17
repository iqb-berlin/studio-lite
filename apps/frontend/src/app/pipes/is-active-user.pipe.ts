import { Pipe, PipeTransform } from '@angular/core';
import { AppService } from '../services/app.service';
import { ACTIVE_THRESHOLD_MS } from '../app.constants';

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
