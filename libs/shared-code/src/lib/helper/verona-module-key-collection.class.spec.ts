import { VeronaModuleKeyCollection } from './verona-module-key-collection.class';

describe('VeronaModuleKeyCollection', () => {
  describe('isInList', () => {
    it('should find exactly the key it was given', () => {
      const collection = new VeronaModuleKeyCollection(['iqb-player@2.8.1']);
      expect(collection.isInList('iqb-player@2.8.1')).toBe(true);
      expect(collection.isInList('iqb-player@2.8.2')).toBe(false);
    });

    it('should keep answering after the caller changed their own list', () => {
      const keys = ['iqb-player@2.8.1'];
      const collection = new VeronaModuleKeyCollection(keys);
      keys.push('iqb-player@2.9.0');
      expect(collection.isInList('iqb-player@2.9.0')).toBe(false);
    });
  });

  describe('getBestMatch', () => {
    it('should return the key itself when it is installed', () => {
      const collection = new VeronaModuleKeyCollection(['iqb-player@2.8.1']);
      expect(collection.getBestMatch('iqb-player@2.8.1')).toBe('iqb-player@2.8.1');
    });

    it('should substitute a later minor version of the same major version', () => {
      const collection = new VeronaModuleKeyCollection(['iqb-player@2.9.0']);
      expect(collection.getBestMatch('iqb-player@2.8.1')).toBe('iqb-player@2.9.0');
    });

    it('should not substitute an earlier minor version', () => {
      const collection = new VeronaModuleKeyCollection(['iqb-player@2.7.0']);
      expect(collection.getBestMatch('iqb-player@2.8.1')).toBe('');
    });

    it('should not substitute across major versions', () => {
      const collection = new VeronaModuleKeyCollection(['iqb-player@3.0.0']);
      expect(collection.getBestMatch('iqb-player@2.8.1')).toBe('');
    });

    it('should return empty for a key that does not parse', () => {
      const collection = new VeronaModuleKeyCollection(['iqb-player@2.9.0']);
      expect(collection.getBestMatch('not-a-module-key')).toBe('');
    });
  });

  describe('isValid', () => {
    it('should be true for an installed key', () => {
      expect(new VeronaModuleKeyCollection(['iqb-player@2.8.1']).isValid('iqb-player@2.8.1')).toBe(true);
    });

    it('should be the substituting key when only a later minor version is installed', () => {
      expect(new VeronaModuleKeyCollection(['iqb-player@2.9.0']).isValid('iqb-player@2.8.1'))
        .toBe('iqb-player@2.9.0');
    });

    it('should be false when nothing qualifies', () => {
      expect(new VeronaModuleKeyCollection(['iqb-editor@1.0.0']).isValid('iqb-player@2.8.1')).toBe(false);
    });
  });

  describe('getSortKey', () => {
    it('should order minor versions numerically, not alphabetically', () => {
      const nine = VeronaModuleKeyCollection.getSortKey('iqb-player@1.9.0');
      const ten = VeronaModuleKeyCollection.getSortKey('iqb-player@1.10.0');
      expect(nine < ten).toBe(true);
    });

    it('should tell two patch versions apart', () => {
      const one = VeronaModuleKeyCollection.getSortKey('iqb-player@2.8.1');
      const two = VeronaModuleKeyCollection.getSortKey('iqb-player@2.8.2');
      expect(one).not.toEqual(two);
      expect(one < two).toBe(true);
    });

    it('should sort a pre-release after the release it belongs to', () => {
      const release = VeronaModuleKeyCollection.getSortKey('iqb-player@2.8.0');
      const preRelease = VeronaModuleKeyCollection.getSortKey('iqb-player@2.8.0-beta.1');
      expect(release < preRelease).toBe(true);
    });

    it('should return a key that does not parse unchanged', () => {
      expect(VeronaModuleKeyCollection.getSortKey('not-a-module-key')).toBe('not-a-module-key');
    });
  });

  describe('getSorted', () => {
    it('should order the keys by name and version', () => {
      const collection = new VeronaModuleKeyCollection([
        'iqb-player@1.10.0', 'iqb-player@1.9.0', 'iqb-editor@2.0.0'
      ]);
      expect(collection.getSorted()).toEqual(['iqb-editor@2.0.0', 'iqb-player@1.9.0', 'iqb-player@1.10.0']);
    });

    it('should keep both of two patch versions', () => {
      const collection = new VeronaModuleKeyCollection(['iqb-player@2.8.1', 'iqb-player@2.8.2']);
      expect(collection.getSorted()).toEqual(['iqb-player@2.8.1', 'iqb-player@2.8.2']);
    });
  });

  describe('hasEntries', () => {
    it('should say whether any module is installed', () => {
      expect(new VeronaModuleKeyCollection([]).hasEntries()).toBe(false);
      expect(new VeronaModuleKeyCollection(['iqb-player@2.8.1']).hasEntries()).toBe(true);
    });
  });
});
