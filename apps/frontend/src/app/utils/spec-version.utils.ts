/**
 * The major version of the Verona spec a module names in its ready notification, or `undefined`
 * when it names none that can be read. The spec version stands in the module's metadata; modules
 * written before the metadata was sent name it as `apiVersion` or `specVersion` of the message.
 *
 * It never throws: a module that names no readable version is still talked to, in the version the
 * caller falls back to (#2007).
 */
export function readSpecVersion(message: { metadata?: unknown; apiVersion?: unknown; specVersion?: unknown }):
number | undefined {
  const { metadata } = message;
  const fromMetadata = metadata && typeof metadata === 'object' ?
    (metadata as { specVersion?: unknown }).specVersion :
    undefined;
  const major = [fromMetadata, message.apiVersion, message.specVersion]
    .find((version): version is string => typeof version === 'string' && /\d/.test(version))
    ?.match(/\d+/);
  return major ? Number(major[0]) : undefined;
}
