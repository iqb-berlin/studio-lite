export const JWT_EXPIRES_IN = '30m';
export const REFRESH_TOKEN_EXPIRES_IN_SEC = 7 * 24 * 60 * 60; // 7 days
// Inactivity threshold matches the refresh token lifespan for infinite extendability
export const INACTIVITY_THRESHOLD_SEC = REFRESH_TOKEN_EXPIRES_IN_SEC;
