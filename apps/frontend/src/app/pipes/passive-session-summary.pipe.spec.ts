import { createMock } from '@golevelup/ts-jest';
import { UserSessionInfoDto } from '@studio-lite-lib/api-dto';
import { PassiveSessionSummaryPipe } from './passive-session-summary.pipe';
import { I18nService } from '../services/i18n.service';

describe('PassiveSessionSummaryPipe', () => {
  let pipe: PassiveSessionSummaryPipe;
  const formatsIn = (shortDateTimeFormat: string) => createMock<I18nService>({ shortDateTimeFormat });

  const passiveAt = (sessionId: string, day: number): UserSessionInfoDto => ({
    sessionId,
    activityStatus: 'passive',
    lastActivity: new Date(2026, 10, day, 9, 30)
  });

  beforeEach(() => {
    pipe = new PassiveSessionSummaryPipe('en-US', formatsIn('dd.MM., HH:mm'));
  });

  it('should write the times in the format of the interface language (#2175)', () => {
    pipe = new PassiveSessionSummaryPipe('en-US', formatsIn('dd/MM, HH:mm'));

    expect(pipe.transform([passiveAt('p1', 9)]).times).toBe('09/11, 09:30');
  });

  it('should count only the passive sessions and list their times newest first (#2150)', () => {
    const summary = pipe.transform([
      passiveAt('p1', 9),
      { sessionId: 'a1', activityStatus: 'active', lastActivity: new Date(2026, 10, 16, 12, 0) },
      passiveAt('p2', 13),
      { sessionId: 'o1', activityStatus: 'orphaned', lastActivity: new Date(2026, 10, 15, 12, 0) },
      passiveAt('p3', 11)
    ]);

    expect(summary).toEqual({
      count: 3,
      times: '13.11., 09:30\n11.11., 09:30\n09.11., 09:30',
      more: 0
    });
  });

  it('should list the ten most recent times and count the rest (#2150)', () => {
    const sessions = Array.from({ length: 12 }, (_, i) => passiveAt(`p${i}`, i + 1));

    const summary = pipe.transform(sessions);

    expect(summary.count).toBe(12);
    expect(summary.times.split('\n')).toHaveLength(10);
    expect(summary.times.startsWith('12.11., 09:30')).toBe(true);
    expect(summary.times.endsWith('03.11., 09:30')).toBe(true);
    expect(summary.more).toBe(2);
  });

  it('should count a passive session without a time among the rest', () => {
    const summary = pipe.transform([passiveAt('p1', 9), { sessionId: 'p2', activityStatus: 'passive' }]);

    expect(summary).toEqual({ count: 2, times: '09.11., 09:30', more: 1 });
  });

  it('should treat a missing session list as empty', () => {
    expect(pipe.transform(undefined)).toEqual({ count: 0, times: '', more: 0 });
  });
});
