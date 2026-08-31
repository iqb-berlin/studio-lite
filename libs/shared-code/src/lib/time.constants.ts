/**
 * Every duration the session model needs, each with exactly one name.
 *
 * Two of them carry the model: {@link ACTIVE_THRESHOLD_MS} and {@link PASSIVE_THRESHOLD_MS}.
 * The session status in the admin list is read off those two and nothing else -- a session is
 * active while an access token issued for it can still be valid, passive while an unexpired
 * refresh token can still resume it, and orphaned once neither is left.
 */

/** The unit the other durations are built from. */
const SECOND_MS = 1000;
/** 60 seconds. */
const MINUTE_MS = 60 * SECOND_MS;
/** 60 minutes. */
const HOUR_MS = 60 * MINUTE_MS;
/** 24 hours. */
const DAY_MS = 24 * HOUR_MS;

/**
 * How long a session counts as active after the last interaction. It is also the access-token
 * lifetime, which is why {@link JWT_EXPIRES_IN} is derived from it: a token that outlived the
 * active phase would let a passive session act as an active one.
 */
export const ACTIVE_THRESHOLD_MS = 30 * MINUTE_MS;
/**
 * How long a session survives without any interaction at all. It is simultaneously the
 * inactivity window (past it, a refresh is denied and the row is expired) and the refresh-token
 * lifetime, because a refresh token that outlived the window would be a key to a session the
 * server already considers gone. Those are not three coincidentally equal values -- they are one
 * duration seen from three sides.
 */
export const PASSIVE_THRESHOLD_MS = 7 * DAY_MS;

/** How often the status bar redraws the remaining session time. */
export const UI_BAR_REFRESH_INTERVAL_MS = SECOND_MS;
/** How often the admin user list asks the server for the current sessions. */
export const ADMIN_USER_LIST_POLL_INTERVAL_MS = 15 * SECOND_MS;
/** Shortest distance between two activity reports sent to the server. */
export const ACTIVITY_SYNC_THROTTLE_MS = 5 * SECOND_MS;
/** Shortest distance between two local activity notices raised from user input. */
export const USER_ACTIVITY_THROTTLE_MS = SECOND_MS;
/** Shortest distance between two activity notices raised from a hosted module's postMessage. */
export const POST_MESSAGE_ACTIVITY_THROTTLE_MS = SECOND_MS;
/** How long the logout message stays readable before the redirect follows. */
export const AUTO_LOGOUT_REDIRECT_DELAY_MS = SECOND_MS;
/**
 * HTTP Date headers only carry second resolution, so successive clock-skew measurements jitter
 * by up to ±1s; only offsets beyond this deadband are real skew.
 */
export const SERVER_TIME_OFFSET_DEADBAND_MS = 2 * SECOND_MS;

/**
 * The only value the codebase needs in seconds: @nestjs/jwt takes signOptions.expiresIn as a
 * number of seconds.
 */
export const JWT_EXPIRES_IN = ACTIVE_THRESHOLD_MS / SECOND_MS;

/**
 * Throws when one of the values above has been edited into an impossible combination. Only
 * invariants that a wrong edit can actually violate are checked. Comparing a value against
 * something it is derived from cannot fail and is therefore not a check at all -- such
 * comparisons used to make this function look like validation while validating nothing.
 */
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
};
