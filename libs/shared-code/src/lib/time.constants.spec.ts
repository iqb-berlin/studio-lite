import {
  ACTIVE_THRESHOLD_MS,
  PASSIVE_THRESHOLD_MS,
  JWT_EXPIRES_IN,
  ADMIN_USER_LIST_POLL_INTERVAL_MS,
  assertTimeConfig
} from './time.constants';

// Only relations between independently chosen values are worth asserting. The tests that
// compared a constant with the expression it was derived from went with the aliases they
// guarded -- they could not have failed, and their passing said nothing.
describe('time.constants', () => {
  it('should keep active threshold lower or equal than passive threshold', () => {
    expect(ACTIVE_THRESHOLD_MS).toBeLessThanOrEqual(PASSIVE_THRESHOLD_MS);
  });

  // @nestjs/jwt takes signOptions.expiresIn in seconds, so a fractional value would be
  // silently wrong rather than rejected.
  it('should express the access token lifetime as whole seconds', () => {
    expect(Number.isInteger(JWT_EXPIRES_IN)).toBe(true);
  });

  it('should keep admin poll interval below the passive threshold', () => {
    expect(ADMIN_USER_LIST_POLL_INTERVAL_MS).toBeLessThan(PASSIVE_THRESHOLD_MS);
  });

  it('should pass runtime config assertions', () => {
    expect(() => assertTimeConfig()).not.toThrow();
  });
});
