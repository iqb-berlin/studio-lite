export const JWT_EXPIRES_IN = '2m';
export const ACTIVE_SESSION_THRESHOLD_SEC = 120; // 2 minutes
export const REFRESH_TOKEN_EXPIRES_IN_SEC = 180; // 3 minutes
// Inactivity threshold matches the refresh token lifespan for infinite extendability
export const INACTIVITY_THRESHOLD_SEC = REFRESH_TOKEN_EXPIRES_IN_SEC;
