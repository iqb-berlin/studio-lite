import { profileIdTransformer } from './metadata.entity';

describe('profileIdTransformer', () => {
  const github = 'https://raw.githubusercontent.com/iqb-vocabs/p11/master/unit.json';
  const w3id = 'https://w3id.org/iqb/p11/unit/';

  describe('to (writing)', () => {
    it('rewrites the legacy github spelling to w3id', () => {
      expect(profileIdTransformer.to(github)).toBe(w3id);
      expect(profileIdTransformer.to('https://raw.githubusercontent.com/iqb-vocabs/p52/master/item.json'))
        .toBe('https://w3id.org/iqb/p52/item/');
    });

    it('keeps an already canonical id unchanged', () => {
      expect(profileIdTransformer.to(w3id)).toBe(w3id);
    });

    it('keeps a foreign profile host unchanged', () => {
      const foreign = 'https://example.org/own/profile.json';
      expect(profileIdTransformer.to(foreign)).toBe(foreign);
    });

    it('passes empty and missing values through without throwing', () => {
      expect(profileIdTransformer.to('')).toBe('');
      expect(profileIdTransformer.to(undefined)).toBeUndefined();
      expect(profileIdTransformer.to(null)).toBeNull();
    });
  });

  describe('from (reading)', () => {
    it('is the identity — stored ids are already canonical', () => {
      expect(profileIdTransformer.from(w3id)).toBe(w3id);
      expect(profileIdTransformer.from(undefined)).toBeUndefined();
    });
  });
});
