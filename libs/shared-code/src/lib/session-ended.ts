/**
 * The message of the 401 the API answers a token with once its session has ended: a new password,
 * a logout, a deleted account (#2115). It tells that refusal apart from the 401 of an expired
 * token. A token that was renewed a moment ago and is refused with it belongs to a session that
 * ended in between, and the frontend logs out instead of showing a missing permission.
 */
export const SESSION_ENDED_MESSAGE = 'Session ended';
