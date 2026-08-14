import { Pipe, PipeTransform } from '@angular/core';
import { SessionActivityStatus, UserSessionInfoDto } from '@studio-lite-lib/api-dto';

// Counting in a pure pipe instead of a template expression: session lists are re-read on
// every change detection cycle while the admin list polls, and array methods in a
// template would run each time.
@Pipe({
  name: 'countSessionsWithStatus',
  standalone: true
})
export class CountSessionsWithStatusPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(sessions: UserSessionInfoDto[] | undefined, status: SessionActivityStatus): number {
    return (sessions || []).filter(session => session.activityStatus === status).length;
  }
}
