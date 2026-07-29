/**
 * Mime types browsers report for a `.zip` file.
 *
 * The value depends on the operating system: Linux and macOS send
 * `application/zip`, while Windows derives it from the registry entry for the
 * `.zip` extension and typically sends `application/x-zip-compressed`.
 * All variants have to be accepted, otherwise zip uploads fail with HTTP 415
 * depending on the client's platform.
 */
export const ZIP_MIME_TYPES = [
  'application/zip',
  'application/x-zip-compressed',
  'multipart/x-zip'
];
