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
/**
 * The w3id spelling. Anchored on the host the rewrite rule actually names, so a self-hosted
 * copy of a profile is never silently equated with — or rewritten to — the official one.
 * Scheme and the `www.` alias are accepted as variants of the same id and normalized away by
 * {@link toW3idProfileId}.
 */
const W3ID_PROFILE = /^https?:\/\/(?:www\.)?w3id\.org\/iqb\/(p\d+)\/([a-z]+)\/?$/i;
/**
 * The github spelling the rewrite rule redirects to. `refs/heads/master` is what github's
 * "copy raw file" button produces; it serves the same document as the shorter `master` form and
 * is therefore accepted as the same id — the registry url an admin pasted by hand is regularly
 * in that form.
 */
const GITHUB_PROFILE =
  /^https?:\/\/raw\.githubusercontent\.com\/iqb-vocabs\/(p\d+)\/(?:refs\/heads\/)?master\/([a-z]+)\.json$/i;
/**
 * The internal key both spellings are reduced to. {@link toW3idProfileId} reads its parts to build
 * the w3id url -- but only for a value it recognized as a profile url first: a string a client
 * spelled like this key is never rewritten (see the note in that function).
 */
const CANONICAL_PROFILE_KEY = /^iqb:(p\d+):([a-z]+)$/;

/**
 * Reduces both known spellings of the SAME profile to one stable key. Unknown URL forms are
 * returned unchanged, so any other comparison falls back to an exact match — this never equates
 * two different profiles.
 */
export function canonicalizeProfileId(profileId: string): string {
  if (!profileId) return profileId;
  const w3id = W3ID_PROFILE.exec(profileId);
  if (w3id) return `iqb:${w3id[1].toLowerCase()}:${w3id[2].toLowerCase()}`;
  const github = GITHUB_PROFILE.exec(profileId);
  if (github) return `iqb:${github[1].toLowerCase()}:${github[2].toLowerCase()}`;
  return profileId;
}

/**
 * Whether two profile ids denote the same profile, regardless of which spelling each uses. A
 * missing id never matches a present one; two identically empty values (both `undefined`, both
 * `''`) do match, so a caller that must not treat "no profile" as a match has to check for one
 * first.
 */
export function profileIdsMatch(
  a: string | undefined | null,
  b: string | undefined | null
): boolean {
  if (!a || !b) return a === b;
  return canonicalizeProfileId(a) === canonicalizeProfileId(b);
}

/**
 * Rewrites any recognized spelling of an IQB profile id into the ONE canonical
 * w3id form — the exact inverse of the w3id rewrite rule above:
 *
 *   https://raw.githubusercontent.com/iqb-vocabs/p11/master/unit.json
 *     -> https://w3id.org/iqb/p11/unit/
 *   https://w3id.org/iqb/p11/unit  (no trailing slash, www., http)
 *     -> https://w3id.org/iqb/p11/unit/
 *
 * Anything canonicalizeProfileId does not recognize — foreign hosts, self-hosted
 * copies, store urls, empty values — is returned unchanged. Built on top of
 * canonicalizeProfileId so exactly one pair of patterns defines what an IQB
 * profile id is: comparison and rewriting can never drift apart.
 *
 * Because this produces a single spelling, downstream comparisons can stay exact
 * (===) as long as both sides pass through here (#1570).
 */
export function toW3idProfileId(profileId: string): string {
  if (!profileId) return profileId;
  const canonical = canonicalizeProfileId(profileId);
  // Only a value canonicalizeProfileId actually RECOGNIZED may be rewritten. It
  // returns anything else unchanged — including a string that happens to be spelled
  // like the internal key (`iqb:p11:unit`), which a client could otherwise post to
  // have it promoted into the official profile url.
  if (canonical === profileId) return profileId;
  const key = CANONICAL_PROFILE_KEY.exec(canonical);
  return key ? `https://w3id.org/iqb/${key[1]}/${key[2]}/` : profileId;
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
