// Session Timings
export const ACTIVE_THRESHOLD_MS = 30 * 60 * 1000; // 30 minutes (matches JWT lifespan)
export const PASSIVE_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000; // 7 days (remaining session)

// Intervall Settings
export const HEARTBEAT_PING_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes (Ping less frequently for long sessions)
export const UI_BAR_REFRESH_INTERVAL_MS = 60 * 1000; // 1 minute (Visual bar update is plenty for long phases)
export const ADMIN_USER_LIST_POLL_INTERVAL_MS = 60 * 1000; // 1 minute
