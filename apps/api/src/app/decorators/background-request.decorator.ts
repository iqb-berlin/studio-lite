import { CustomDecorator, SetMetadata } from '@nestjs/common';

/** Metadata key under which {@link BackgroundRequest} stores its mode for the interceptor to read. */
export const BACKGROUND_REQUEST_KEY = 'backgroundRequest';

/** How a marked route is treated when {@link ActivityInterceptor} decides what counts as activity. */
export type BackgroundRequestMode =
  // Never counts as user interaction, whatever the caller claims.
  'always' |
  // Counts only when the request declares user intent, because the same route serves
  // both a periodic poll and a user-triggered refresh.
  'unless-user-intent';

/**
 * Marks a route whose requests must not extend the inactivity window.
 *
 * This used to be decided by matching substrings against the request URL, which silently
 * caught neighbouring routes: `/group-admin/users` also matched
 * `/group-admin/users/:id/workspaces`, so saving a user's workspace assignments did not
 * count as interaction (#1517). A marking on the handler cannot reach a route nobody put
 * it on, and it is visible where the route is defined rather than in a list far away.
 */
export const BackgroundRequest = (
  mode: BackgroundRequestMode = 'always'
): CustomDecorator => SetMetadata(BACKGROUND_REQUEST_KEY, mode);
