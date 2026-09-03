/**
 * The access levels a workspace membership can carry, in the order both access-rights panels
 * render them. What each number means is deliberately not said here, because the repository
 * says it twice and differently: the label comes from the i18n key
 * `access-rights.access-level-<n>` ("Kommentierer:in", "Entwickler:in", "Admin"), while
 * `RolePipe` reads the same number as a position on a five-step ladder and answers 4 with
 * `super`, with a `maintainer` at 3 that no panel offers. Reconciling the two is #1658.
 */
export const ACCESS_LEVELS = [1, 2, 4] as const;
