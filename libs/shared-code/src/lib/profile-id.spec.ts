import {
  canonicalizeProfileId, isItemProfileId, profileIdsMatch, toW3idProfileId
} from './profile-id';

describe('profile-id', () => {
  const github = 'https://raw.githubusercontent.com/iqb-vocabs/p11/master/unit.json';
  const w3id = 'https://w3id.org/iqb/p11/unit/';

  describe('canonicalizeProfileId', () => {
    it('maps the github and w3id spelling of the same profile to the same key', () => {
      expect(canonicalizeProfileId(github)).toBe('iqb:p11:unit');
      expect(canonicalizeProfileId(w3id)).toBe('iqb:p11:unit');
    });

    it('tolerates a missing trailing slash on the w3id form', () => {
      expect(canonicalizeProfileId('https://w3id.org/iqb/p11/unit')).toBe('iqb:p11:unit');
    });

    it('keeps unit and item profiles distinct', () => {
      expect(canonicalizeProfileId('https://w3id.org/iqb/p11/item/')).toBe('iqb:p11:item');
      expect(canonicalizeProfileId(w3id)).not.toBe('iqb:p11:item');
    });

    it('recognizes the refs/heads/master spelling of the raw github url', () => {
      // what github's "copy raw file" button produces; it serves the same document
      expect(canonicalizeProfileId('https://raw.githubusercontent.com/iqb-vocabs/p11/refs/heads/master/unit.json'))
        .toBe('iqb:p11:unit');
    });

    it('returns unknown url forms unchanged', () => {
      const other = 'https://example.org/some/profile.json';
      expect(canonicalizeProfileId(other)).toBe(other);
      // the classic store url is not a profile and must not be canonicalized
      const store = 'https://raw.githubusercontent.com/iqb-vocabs/p111/master/profile-config.json';
      expect(canonicalizeProfileId(store)).toBe(store);
    });
  });

  describe('profileIdsMatch', () => {
    it('matches the two spellings of the same profile', () => {
      expect(profileIdsMatch(github, w3id)).toBe(true);
    });

    it('does not match different profile numbers', () => {
      expect(profileIdsMatch(w3id, 'https://w3id.org/iqb/p100/unit/')).toBe(false);
    });

    it('does not match unit against item', () => {
      expect(profileIdsMatch(w3id, 'https://w3id.org/iqb/p11/item/')).toBe(false);
    });

    it('falls back to exact comparison for unknown forms', () => {
      expect(profileIdsMatch('abc', 'abc')).toBe(true);
      expect(profileIdsMatch('abc', 'def')).toBe(false);
    });

    it('treats nullish ids with strict equality', () => {
      expect(profileIdsMatch(undefined, undefined)).toBe(true);
      expect(profileIdsMatch(github, undefined)).toBe(false);
    });
  });

  describe('toW3idProfileId', () => {
    it('rewrites the github spelling to the w3id form', () => {
      expect(toW3idProfileId(github)).toBe(w3id);
      expect(toW3idProfileId('https://raw.githubusercontent.com/iqb-vocabs/p111/master/item.json'))
        .toBe('https://w3id.org/iqb/p111/item/');
    });

    it('keeps an already-canonical w3id id unchanged', () => {
      expect(toW3idProfileId(w3id)).toBe(w3id);
    });

    it('normalizes the w3id variants onto the one canonical spelling', () => {
      // without these, an exact comparison would treat the same profile as two
      expect(toW3idProfileId('https://w3id.org/iqb/p11/unit')).toBe(w3id);
      expect(toW3idProfileId('https://www.w3id.org/iqb/p11/unit/')).toBe(w3id);
      expect(toW3idProfileId('http://w3id.org/iqb/p11/unit/')).toBe(w3id);
    });

    it('is idempotent', () => {
      expect(toW3idProfileId(toW3idProfileId(github))).toBe(w3id);
    });

    it('does not rewrite a self-hosted copy to the official profile', () => {
      const selfHosted = 'https://example.org/mirror/iqb-vocabs/p11/master/unit.json';
      expect(toW3idProfileId(selfHosted)).toBe(selfHosted);
      expect(profileIdsMatch(selfHosted, w3id)).toBe(false);
    });

    it('keeps foreign or unknown forms unchanged', () => {
      const other = 'https://example.org/some/profile.json';
      expect(toW3idProfileId(other)).toBe(other);
      // the classic store url is not a profile and must not be rewritten
      const store = 'https://raw.githubusercontent.com/iqb-vocabs/p11/master/profile-config.json';
      expect(toW3idProfileId(store)).toBe(store);
    });

    it('rewrites the refs/heads/master spelling as well', () => {
      expect(toW3idProfileId('https://raw.githubusercontent.com/iqb-vocabs/p11/refs/heads/master/unit.json'))
        .toBe(w3id);
    });

    it('does not promote the internal key spelling into an official profile url', () => {
      // a client could otherwise post `iqb:p11:unit` and have it stored as p11
      expect(toW3idProfileId('iqb:p11:unit')).toBe('iqb:p11:unit');
    });

    it('keeps empty values unchanged', () => {
      expect(toW3idProfileId('')).toBe('');
    });

    it('produces an id the comparison helpers treat as the same profile', () => {
      expect(profileIdsMatch(toW3idProfileId(github), github)).toBe(true);
      expect(isItemProfileId(toW3idProfileId('https://raw.githubusercontent.com/iqb-vocabs/p11/master/item.json')))
        .toBe(true);
    });
  });

  describe('isItemProfileId', () => {
    it('recognizes the classic github item/unit filenames', () => {
      expect(isItemProfileId('https://raw.githubusercontent.com/iqb-vocabs/p11/master/item.json')).toBe(true);
      expect(isItemProfileId('https://raw.githubusercontent.com/iqb-vocabs/p11/master/unit.json')).toBe(false);
    });

    it('recognizes the newer w3id item/unit path segments (trailing slash)', () => {
      expect(isItemProfileId('https://w3id.org/iqb/p100/item/')).toBe(true);
      expect(isItemProfileId('https://w3id.org/iqb/p100/unit/')).toBe(false);
    });

    it('treats unknown or empty forms as not-an-item', () => {
      expect(isItemProfileId('https://example.org/whatever')).toBe(false);
      expect(isItemProfileId('')).toBe(false);
      expect(isItemProfileId(undefined)).toBe(false);
    });
  });
});
