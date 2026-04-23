import {
  ACTIVE_THRESHOLD_MS,
  PASSIVE_THRESHOLD_MS,
  ACTIVE_SESSION_THRESHOLD_MS,
  JWT_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN_MS,
  INACTIVITY_THRESHOLD_MS,
  ADMIN_USER_LIST_POLL_INTERVAL_MS,
  assertTimeConfig
} from './time.constants';

describe('time.constants', () => {
  it('should keep active threshold lower or equal than passive threshold', () => {
    expect(ACTIVE_THRESHOLD_MS).toBeLessThanOrEqual(PASSIVE_THRESHOLD_MS);
  });

  it('should align backend active session threshold with frontend active threshold', () => {
    expect(ACTIVE_SESSION_THRESHOLD_MS).toBe(ACTIVE_THRESHOLD_MS);
  });

  it('should align JWT expiration with active threshold', () => {
    expect(JWT_EXPIRES_IN).toBe(ACTIVE_THRESHOLD_MS / 1000);
  });

  it('should align refresh token and inactivity timeout with passive threshold', () => {
    expect(REFRESH_TOKEN_EXPIRES_IN_MS).toBe(PASSIVE_THRESHOLD_MS);
    expect(INACTIVITY_THRESHOLD_MS).toBe(REFRESH_TOKEN_EXPIRES_IN_MS);
  });

  it('should keep admin poll interval below inactivity timeout', () => {
    expect(ADMIN_USER_LIST_POLL_INTERVAL_MS).toBeLessThan(INACTIVITY_THRESHOLD_MS);
  });

  it('should pass runtime config assertions', () => {
    expect(() => assertTimeConfig()).not.toThrow();
  });
});
