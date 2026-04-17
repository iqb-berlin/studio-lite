// Session Timings
export const ACTIVE_THRESHOLD_MS = 2 * 60 * 1000; // 2 minutes for testing
// Total inactivity timeout since last user activity (active + passive visualization).
export const PASSIVE_THRESHOLD_MS = 3 * 60 * 1000; // 3 minutes for testing

// Intervall Settings
export const HEARTBEAT_PING_INTERVAL_MS = 30 * 1000; // 30 seconds for testing
export const UI_BAR_REFRESH_INTERVAL_MS = 1000; // 1 second for smoother header bar precision
export const ADMIN_USER_LIST_POLL_INTERVAL_MS = 15 * 1000; // 15 seconds for faster admin/users sync
