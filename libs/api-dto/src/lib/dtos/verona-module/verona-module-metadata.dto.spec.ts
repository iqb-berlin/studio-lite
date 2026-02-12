import { VeronaModuleMetadataDto, type VeronaModuleType } from '@studio-lite-lib/api-dto';

describe('VeronaModuleMetadataDto', () => {
  describe('getFromJsonLd', () => {
    it('prefers German name when type metadata is provided', () => {
      const result = VeronaModuleMetadataDto.getFromJsonLd({
        type: 'editor',
        model: 'iqb',
        id: 'module-a',
        version: '1.2.3',
        specVersion: '4.0',
        name: [
          { lang: 'en', value: 'English Name' },
          { lang: 'de', value: 'Deutscher Name' }
        ],
        apiVersion: '4.0',
        '@id': 'module-a',
        '@type': 'editor'
      });

      expect(result).toEqual({
        type: 'editor',
        model: 'iqb',
        id: 'module-a',
        name: 'Deutscher Name',
        version: '1.2.3',
        specVersion: '4.0',
        isStable: true
      });
    });

    it('falls back to English name when German is missing', () => {
      const result = VeronaModuleMetadataDto.getFromJsonLd({
        type: 'player',
        model: 'iqb',
        id: 'module-b',
        version: '2.0.0',
        specVersion: '5.0',
        name: [{ lang: 'en', value: 'English Only' }],
        apiVersion: '5.0',
        '@id': 'module-b',
        '@type': 'player'
      });

      expect(result?.name).toBe('English Only');
    });

    it('falls back to id when no name is available', () => {
      const result = VeronaModuleMetadataDto.getFromJsonLd({
        type: 'schemer',
        model: '',
        id: 'module-c',
        version: '1.0.0',
        specVersion: '3.0',
        name: [],
        apiVersion: '3.0',
        '@id': 'module-c',
        '@type': 'schemer'
      });

      expect(result?.name).toBe('module-c');
    });

    it('parses @type metadata and uses apiVersion as specVersion', () => {
      const result = VeronaModuleMetadataDto.getFromJsonLd(asJsonLdInput({
        model: 'vendor',
        id: 'ignored',
        version: '1.0.0-beta',
        specVersion: 'ignored',
        name: { en: 'English Name' },
        apiVersion: '6.1',
        '@id': 'module-d',
        '@type': 'widget'
      }));

      expect(result).toEqual({
        type: 'widget',
        model: 'vendor',
        id: 'module-d',
        name: 'English Name',
        version: '1.0.0-beta',
        specVersion: '6.1',
        isStable: false
      });
    });

    it('returns null when no type information is provided', () => {
      const result = VeronaModuleMetadataDto.getFromJsonLd(asJsonLdInput({}));
      expect(result).toBeNull();
    });
  });

  describe('getKey', () => {
    it('returns id@version for pre-stable versions', () => {
      const metadata = {
        id: 'module-x',
        version: '1.0.0-beta'
      } as VeronaModuleMetadataDto;

      expect(VeronaModuleMetadataDto.getKey(metadata)).toBe('module-x@1.0.0-beta');
    });

    it('returns id@major.minor for stable versions', () => {
      const metadata = {
        id: 'module-y',
        version: '2.10.5'
      } as VeronaModuleMetadataDto;

      expect(VeronaModuleMetadataDto.getKey(metadata)).toBe('module-y@2.10');
    });

    it('falls back to full version when no major.minor match exists', () => {
      const metadata = {
        id: 'module-z',
        version: 'v1'
      } as VeronaModuleMetadataDto;

      expect(VeronaModuleMetadataDto.getKey(metadata)).toBe('module-z@v1');
    });
  });

  describe('isPreStableVersion', () => {
    it('detects pre-stable suffixes', () => {
      expect(VeronaModuleMetadataDto.isPreStableVersion('1.2.0-beta')).toBe(true);
    });

    it('returns false for stable versions', () => {
      expect(VeronaModuleMetadataDto.isPreStableVersion('1.2.0')).toBe(false);
    });
  });
});

type JsonLdInput = {
  type: VeronaModuleType;
  model: string;
  id: string;
  version: string;
  specVersion: string;
  name: { lang: string; value: string }[] | { [x: string]: string };
  apiVersion: string;
  '@id': string;
  '@type': string;
};

const asJsonLdInput = (input: Partial<JsonLdInput>): JsonLdInput => input as unknown as JsonLdInput;
