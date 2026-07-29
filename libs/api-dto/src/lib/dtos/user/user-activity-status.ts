// A single session is always at least 'orphaned'; only a user without any
// valid session can be 'inactive'.
export type SessionActivityStatus = 'active' | 'passive' | 'orphaned';
export type UserActivityStatus = SessionActivityStatus | 'inactive';
