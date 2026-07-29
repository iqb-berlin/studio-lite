import { canonicalizeProfileId, isItemProfileId, profileIdsMatch } from './profile-id';

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
