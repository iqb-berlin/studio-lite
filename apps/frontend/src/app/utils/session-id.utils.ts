/**
 * A random id in the form the API takes for a session: lowercase hex in groups of 8-4-4-4-12.
 *
 * Built from `crypto.getRandomValues`, not with `crypto.randomUUID`: the latter exists only in a
 * secure context, and an installation may be served over plain HTTP
 * (`config/frontend/default.conf.http-template`), where the login would then fail.
 */
export function randomSessionId(): string {
  const hex = Array.from(
    crypto.getRandomValues(new Uint8Array(16)),
    byte => byte.toString(16).padStart(2, '0')
  ).join('');
  return [hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16), hex.slice(16, 20), hex.slice(20)].join('-');
}
