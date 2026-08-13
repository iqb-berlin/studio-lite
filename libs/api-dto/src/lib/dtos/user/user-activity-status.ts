// A session is 'orphaned' once nothing has reported its tab as open for longer than
// ORPHANED_SESSION_THRESHOLD_MS, regardless of how recently someone interacted with it.
// The remaining two describe a session that is still alive: 'active' while the last
// interaction is within ACTIVE_SESSION_THRESHOLD_MS, 'passive' after that. A user is
// 'inactive' only without any valid session at all.
export type SessionActivityStatus = 'active' | 'passive' | 'orphaned';
export type UserActivityStatus = SessionActivityStatus | 'inactive';
