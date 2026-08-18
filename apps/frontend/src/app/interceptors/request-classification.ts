import { HttpContext, HttpContextToken } from '@angular/common/http';

/**
 * How a request wants to be treated by AuthInterceptor. Set at the call site -- the
 * BackendService method knows what it is doing -- instead of guessed from the URL.
 *
 * URL substrings caught neighbouring routes and had to be kept in step with the backend's
 * own list by hand; adding /session-ping in #1569 needed three separate edits and nothing
 * would have complained about a forgotten one (#1517).
 */

// A request nobody asked for: its failure must not raise an error message, because a
// session that has simply expired is not something the user did wrong.
//
// Note where this actually bites: the interceptor only records an error for the message
// path when the failure did NOT go into the token refresh, so the 401 suppression is
// reachable only together with SKIP_TOKEN_REFRESH. On a request that refreshes -- the
// liveness ping, the activity sync -- a 401 is handled by renewing the token, and a
// failed renewal logs out rather than reporting. Marking those as background is therefore
// a statement of intent for the non-401 path, not a way to silence expiry.
export const IS_BACKGROUND_REQUEST = new HttpContextToken<boolean>(() => false);

// A request that must not trigger the 401 token-refresh dance. Either it *is* the refresh,
// or it is an auth call whose 401 is a legitimate answer (wrong password, gone session)
// rather than an expired access token.
export const SKIP_TOKEN_REFRESH = new HttpContextToken<boolean>(() => false);

export const backgroundRequestContext = (): HttpContext => new HttpContext()
  .set(IS_BACKGROUND_REQUEST, true);

export const authRequestContext = (): HttpContext => new HttpContext()
  .set(SKIP_TOKEN_REFRESH, true);

// The refresh itself is both: unattended, and the one request that cannot answer its own
// 401 with another refresh.
export const tokenRefreshContext = (): HttpContext => new HttpContext()
  .set(IS_BACKGROUND_REQUEST, true)
  .set(SKIP_TOKEN_REFRESH, true);

// Logout is fired and forgotten, and a 401 means the session is already gone -- refreshing
// a token to retry the disposal of that same session makes no sense.
export const logoutContext = (): HttpContext => new HttpContext()
  .set(IS_BACKGROUND_REQUEST, true)
  .set(SKIP_TOKEN_REFRESH, true);
