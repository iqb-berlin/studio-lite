/**
 * IQB metadata profiles are reachable under two equivalent URL spellings. The
 * authoritative w3id rewrite rule (perma-id/w3id.org, /iqb/.htaccess) maps them
 * onto each other for every profile number:
 *
 *   w3id.org/iqb/p{N}/{target}
 *     -> raw.githubusercontent.com/iqb-vocabs/p{N}/master/{target}.json   [302]
 *
 * A profile's stored `profileId` can therefore use a different spelling than a
 * workspace's configured profile URL even though both denote the same profile
 * (e.g. after a profile switches its self-id from the github to the w3id form).
 * Without canonicalization the exact-string comparison used when deriving a
 * profile's `order` (active vs. hidden) would treat them as different and
 * orphan the existing metadata.
 *
 * canonicalizeProfileId reduces both known spellings of the SAME profile to one
 * stable key. Unknown URL forms are returned unchanged, so any other comparison
 * falls back to an exact match — this never equates two different profiles.
 */
const W3ID_PROFILE = /w3id\.org\/iqb\/(p\d+)\/([a-z]+)\/?$/i;
const GITHUB_PROFILE = /iqb-vocabs\/(p\d+)\/master\/([a-z]+)\.json$/i;

export function canonicalizeProfileId(profileId: string): string {
  if (!profileId) return profileId;
  const w3id = W3ID_PROFILE.exec(profileId);
  if (w3id) return `iqb:${w3id[1].toLowerCase()}:${w3id[2].toLowerCase()}`;
  const github = GITHUB_PROFILE.exec(profileId);
  if (github) return `iqb:${github[1].toLowerCase()}:${github[2].toLowerCase()}`;
  return profileId;
}

export function profileIdsMatch(
  a: string | undefined | null,
  b: string | undefined | null
): boolean {
  if (!a || !b) return a === b;
  return canonicalizeProfileId(a) === canonicalizeProfileId(b);
}

/**
 * Rewrites the github spelling of an IQB profile id into its canonical w3id form
 * (the exact inverse of the w3id rewrite rule above), e.g.
 *
 *   https://raw.githubusercontent.com/iqb-vocabs/p11/master/unit.json
 *     -> https://w3id.org/iqb/p11/unit/
 *
 * Any other value — already-w3id ids, foreign hosts, empty strings — is returned
 * unchanged. Apply this wherever profile ids enter persistence (unit imports,
 * metadata patches), so the database only ever stores the w3id spelling even
 * when the source still carries the legacy github form (#1570).
 */
const GITHUB_PROFILE_URL = /^https:\/\/raw\.githubusercontent\.com\/iqb-vocabs\/(p\d+)\/master\/([a-z]+)\.json$/i;

export function toW3idProfileId(profileId: string): string {
  if (!profileId) return profileId;
  const github = GITHUB_PROFILE_URL.exec(profileId);
  if (github) return `https://w3id.org/iqb/${github[1].toLowerCase()}/${github[2].toLowerCase()}/`;
  return profileId;
}

/**
 * Whether a profile URL denotes an item profile (as opposed to a unit profile),
 * covering both spellings: the classic github filename `.../item.json` and the newer
 * w3id path segment `.../item/`. Any other form is treated as not-an-item (unit).
 */
export function isItemProfileId(profileId: string | undefined | null): boolean {
  if (!profileId) return false;
  const segment = profileId.replace(/\/+$/, '').split('/').pop() ?? '';
  return segment.replace(/\.json$/i, '').toLowerCase() === 'item';
}
