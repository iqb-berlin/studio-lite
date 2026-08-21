// The three states of a session, read off the two tokens it lives by: 'active' while the
// last interaction is within ACTIVE_THRESHOLD_MS and an access token can still be valid,
// 'passive' while only an unexpired refresh token is left -- unused, but resumable -- and
// 'orphaned' once neither is left and nobody can return to it. A user is 'inactive' only
// without any valid session at all.
export type SessionActivityStatus = 'active' | 'passive' | 'orphaned';
export type UserActivityStatus = SessionActivityStatus | 'inactive';
