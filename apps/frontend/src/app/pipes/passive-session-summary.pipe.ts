import {
  Inject, LOCALE_ID, Pipe, PipeTransform
} from '@angular/core';
import { formatDate } from '@angular/common';
import { UserSessionInfoDto } from '@studio-lite-lib/api-dto';

export const PASSIVE_SESSION_TIMES_SHOWN = 10;

export interface PassiveSessionSummary {
  count: number;
  // The last activity of the most recent passive sessions, newest first, one per line.
  times: string;
  // Passive sessions not listed in times.
  more: number;
}

/**
 * The passive sessions of one account, drawn as a single dot. An account that logs in from many
 * separate storages -- pool computers, private windows, scripts against the API -- collects one
 * passive session per login, and a dot for each of them hid the one that mattered: where somebody is
 * working right now (#2150). The tooltip lists the most recent ones; a longer list would outgrow the
 * window.
 */
@Pipe({
  name: 'passiveSessionSummary',
  standalone: true
})
export class PassiveSessionSummaryPipe implements PipeTransform {
  constructor(@Inject(LOCALE_ID) private locale: string) {}

  transform(sessions: UserSessionInfoDto[] | undefined): PassiveSessionSummary {
    const passive = (sessions || []).filter(session => session.activityStatus === 'passive');
    const shown = passive
      .filter(session => !!session.lastActivity)
      .map(session => new Date(session.lastActivity as Date))
      .sort((a, b) => b.getTime() - a.getTime())
      .slice(0, PASSIVE_SESSION_TIMES_SHOWN);
    return {
      count: passive.length,
      times: shown.map(time => formatDate(time, 'dd.MM., HH:mm', this.locale)).join('\n'),
      more: passive.length - shown.length
    };
  }
}
