export const JWT_EXPIRES_IN = '2m';
export const REFRESH_TOKEN_EXPIRES_IN_SEC = 180; // 3 minutes (matching frontend passive threshold)
// Inactivity threshold matches the refresh token lifespan for infinite extendability
export const INACTIVITY_THRESHOLD_SEC = REFRESH_TOKEN_EXPIRES_IN_SEC;
