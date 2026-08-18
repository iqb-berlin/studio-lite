import { UserSessionInfoDto } from '@studio-lite-lib/api-dto';
import { CountSessionsWithStatusPipe } from './count-sessions-with-status.pipe';

describe('CountSessionsWithStatusPipe', () => {
  let pipe: CountSessionsWithStatusPipe;

  const sessions: UserSessionInfoDto[] = [
    { sessionId: 's1', activityStatus: 'active' },
    { sessionId: 's2', activityStatus: 'orphaned' },
    { sessionId: 's3', activityStatus: 'orphaned' },
    { sessionId: 's4', activityStatus: 'passive' }
  ];

  beforeEach(() => {
    pipe = new CountSessionsWithStatusPipe();
  });

  it('should count the sessions carrying the given status', () => {
    expect(pipe.transform(sessions, 'orphaned')).toBe(2);
    expect(pipe.transform(sessions, 'active')).toBe(1);
    expect(pipe.transform(sessions, 'passive')).toBe(1);
  });

  it('should return zero when no session carries the status', () => {
    expect(pipe.transform([{ sessionId: 's1', activityStatus: 'active' }], 'orphaned')).toBe(0);
  });

  it('should treat a missing session list as empty', () => {
    expect(pipe.transform(undefined, 'orphaned')).toBe(0);
  });
});
