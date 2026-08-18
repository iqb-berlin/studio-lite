const SECOND_MS = 1000;
const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

// Two durations carry the whole session model, and each has exactly one name here.
//
// ACTIVE_THRESHOLD_MS is how long a session counts as active after the last interaction.
// It is also the access-token lifetime, which is why JWT_EXPIRES_IN is derived from it: a
// token that outlived the active phase would let a passive session act as an active one.
//
// PASSIVE_THRESHOLD_MS is how long a session survives without any interaction at all. It
// is simultaneously the inactivity window (past it, a refresh is denied and the row is
// expired) and the refresh-token lifetime, because a refresh token that outlived the
// window would be a key to a session the server already considers gone. Those are not
// three coincidentally equal values -- they are one duration seen from three sides.
export const ACTIVE_THRESHOLD_MS = 30 * MINUTE_MS;
export const PASSIVE_THRESHOLD_MS = 7 * DAY_MS;

export const UI_BAR_REFRESH_INTERVAL_MS = SECOND_MS;
export const ADMIN_USER_LIST_POLL_INTERVAL_MS = 15 * SECOND_MS;

// Liveness ("is a tab still open?"), which is a different question from activity
// ("did someone interact?"). Every open tab pings on this interval regardless of
// user interaction, so a session without pings has no browser behind it any more.
export const SESSION_PING_INTERVAL_MS = MINUTE_MS;
// Browsers throttle timers in background tabs to at most one run per minute, so a
// single missed ping means nothing. Tolerate two before calling a session orphaned.
export const ORPHANED_SESSION_THRESHOLD_MS = 3 * SESSION_PING_INTERVAL_MS;
export const ACTIVITY_SYNC_THROTTLE_MS = 5 * SECOND_MS;
export const USER_ACTIVITY_THROTTLE_MS = SECOND_MS;
export const POST_MESSAGE_ACTIVITY_THROTTLE_MS = SECOND_MS;
export const AUTO_LOGOUT_REDIRECT_DELAY_MS = SECOND_MS;
// HTTP Date headers only carry second resolution, so successive clock-skew
// measurements jitter by up to ±1s; only offsets beyond this deadband are real skew.
export const SERVER_TIME_OFFSET_DEADBAND_MS = 2 * SECOND_MS;

// The only value the codebase needs in seconds: @nestjs/jwt takes signOptions.expiresIn
// as a number of seconds.
export const JWT_EXPIRES_IN = ACTIVE_THRESHOLD_MS / SECOND_MS;

// Only invariants that a wrong edit above can actually violate. Checks comparing a value
// against something it is derived from cannot fail and are therefore not checks at all --
// they used to make this function look like validation while validating nothing.
export const assertTimeConfig = (): void => {
  const fail = (message: string): never => {
    throw new Error(`Invalid time config: ${message}`);
  };

  if (ACTIVE_THRESHOLD_MS <= 0) {
    fail('ACTIVE_THRESHOLD_MS must be > 0');
  }

  if (PASSIVE_THRESHOLD_MS <= 0) {
    fail('PASSIVE_THRESHOLD_MS must be > 0');
  }

  if (ACTIVE_THRESHOLD_MS > PASSIVE_THRESHOLD_MS) {
    fail('ACTIVE_THRESHOLD_MS must be <= PASSIVE_THRESHOLD_MS');
  }

  // A sub-second active threshold would make the access-token lifetime fractional, which
  // @nestjs/jwt does not take in seconds.
  if (!Number.isInteger(JWT_EXPIRES_IN)) {
    fail('ACTIVE_THRESHOLD_MS must be a whole number of seconds');
  }

  // The admin list has to be able to observe a session before it expires underneath it.
  if (ADMIN_USER_LIST_POLL_INTERVAL_MS >= PASSIVE_THRESHOLD_MS) {
    fail('ADMIN_USER_LIST_POLL_INTERVAL_MS must stay below PASSIVE_THRESHOLD_MS');
  }

  // With less headroom a background tab throttled to one ping per minute would be
  // reported orphaned while it is still open.
  if (ORPHANED_SESSION_THRESHOLD_MS < 2 * SESSION_PING_INTERVAL_MS) {
    fail('ORPHANED_SESSION_THRESHOLD_MS must allow at least two missed pings');
  }

  // An orphaned session must be detectable while its row still exists, otherwise the
  // status is unreachable and neither the admin display nor the delete path can act.
  if (ORPHANED_SESSION_THRESHOLD_MS >= PASSIVE_THRESHOLD_MS) {
    fail('ORPHANED_SESSION_THRESHOLD_MS must stay below PASSIVE_THRESHOLD_MS');
  }
};
