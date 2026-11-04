import {
  normalizeVeronaModuleType,
  veronaModuleTypesMatch,
  isKnownVeronaModuleType
} from './verona-module-type';

describe('verona-module-type', () => {
  describe('normalizeVeronaModuleType', () => {
    it('upper-cases and trims the given type', () => {
      expect(normalizeVeronaModuleType(' editor ')).toBe('EDITOR');
    });

    it('returns an empty string for nullish input', () => {
      expect(normalizeVeronaModuleType(undefined)).toBe('');
      expect(normalizeVeronaModuleType(null)).toBe('');
    });
  });

  describe('veronaModuleTypesMatch', () => {
    it('matches the legacy lower-case spelling against the current upper-case spelling', () => {
      expect(veronaModuleTypesMatch('editor', 'EDITOR')).toBe(true);
      expect(veronaModuleTypesMatch('PLAYER', 'player')).toBe(true);
    });

    it('does not match different types', () => {
      expect(veronaModuleTypesMatch('editor', 'player')).toBe(false);
    });

    it('does not match when one side is empty', () => {
      expect(veronaModuleTypesMatch('', 'EDITOR')).toBe(false);
      expect(veronaModuleTypesMatch(undefined, null)).toBe(true);
    });
  });

  describe('isKnownVeronaModuleType', () => {
    it('accepts both spellings of a known type', () => {
      expect(isKnownVeronaModuleType('editor')).toBe(true);
      expect(isKnownVeronaModuleType('WIDGET')).toBe(true);
    });

    it('rejects unknown types', () => {
      expect(isKnownVeronaModuleType('unknown')).toBe(false);
      expect(isKnownVeronaModuleType('')).toBe(false);
    });
  });
});
