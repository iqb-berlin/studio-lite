import { UnitMetadataValues } from '@studio-lite-lib/api-dto';
import { LegacyMetadataDownloadClass } from './legacy-metadata-download.class';

describe('LegacyMetadataDownloadClass', () => {
  describe('toLegacyMetadataBlob (frozen XML .vomd shape)', () => {
    it('folds the annotation back into a form-created label and empties annotation', () => {
      const result = LegacyMetadataDownloadClass.toLegacyMetadataBlob({
        profiles: [{
          profileId: 'p1',
          order: 0,
          entries: [{
            id: 'w1',
            label: [{ lang: 'de', value: 'Leitidee' }],
            value: [{
              id: 'https://w3id.org/iqb/vocab/l3',
              label: [{ lang: 'de', value: 'Raum und Form' }],
              annotation: [{ lang: 'de', value: '1.3' }]
            }],
            valueAsText: [{ lang: 'de', value: '1.3 Raum und Form' }]
          }]
        }]
      } as unknown as UnitMetadataValues);

      expect(result.profiles[0].entries[0].value).toEqual([{
        id: 'https://w3id.org/iqb/vocab/l3',
        label: [{ lang: 'de', value: '1.3 Raum und Form' }],
        annotation: []
      }]);
    });

    it('folds the annotation into an imported text entry and drops the annotation key', () => {
      const result = LegacyMetadataDownloadClass.toLegacyMetadataBlob({
        profiles: [{
          profileId: 'p1',
          order: 0,
          entries: [{
            id: 'w2',
            label: [],
            value: [{
              id: 'https://w3id.org/iqb/vocab/l3',
              text: [{ lang: 'de', value: 'Raum und Form' }],
              annotation: [{ lang: 'de', value: '1.3' }]
            }],
            valueAsText: []
          }]
        }]
      } as unknown as UnitMetadataValues);

      expect(result.profiles[0].entries[0].value).toEqual([{
        id: 'https://w3id.org/iqb/vocab/l3',
        text: [{ lang: 'de', value: '1.3 Raum und Form' }]
      }]);
    });

    it('leaves a vocabulary entry without numbering unchanged (label kept, annotation empty)', () => {
      const result = LegacyMetadataDownloadClass.toLegacyMetadataBlob({
        profiles: [{
          profileId: 'p1',
          order: 0,
          entries: [{
            id: 'w3',
            label: [],
            value: [{
              id: 'https://w3id.org/iqb/v24/kh/r5f',
              label: [{ lang: 'de', value: 'nein' }],
              annotation: []
            }],
            valueAsText: [{ lang: 'de', value: 'nein' }]
          }]
        }]
      } as unknown as UnitMetadataValues);

      expect(result.profiles[0].entries[0].value).toEqual([{
        id: 'https://w3id.org/iqb/v24/kh/r5f',
        label: [{ lang: 'de', value: 'nein' }],
        annotation: []
      }]);
    });

    it('passes simple (non-vocabulary) values through untouched', () => {
      const metadata = {
        profiles: [{
          profileId: 'p1',
          order: 0,
          entries: [{
            id: 's1',
            label: [],
            value: { raw: 'true', asText: [{ lang: 'de', value: 'ja' }] },
            valueAsText: [{ lang: 'de', value: 'ja' }]
          }]
        }]
      } as unknown as UnitMetadataValues;

      expect(LegacyMetadataDownloadClass.toLegacyMetadataBlob(metadata)).toEqual(metadata);
    });

    it('keeps the pure label (no numbering) when the field hides numbering', () => {
      const result = LegacyMetadataDownloadClass.toLegacyMetadataBlob({
        profiles: [{
          profileId: 'p1',
          order: 0,
          entries: [{
            id: 'w1',
            label: [],
            value: [{
              id: 'https://w3id.org/iqb/vocab/l3',
              label: [{ lang: 'de', value: 'Raum und Form' }],
              annotation: [{ lang: 'de', value: '1.3' }]
            }],
            valueAsText: [{ lang: 'de', value: 'Raum und Form' }]
          }]
        }]
      } as unknown as UnitMetadataValues, { p1: { w1: true } });

      expect(result.profiles[0].entries[0].value).toEqual([{
        id: 'https://w3id.org/iqb/vocab/l3',
        label: [{ lang: 'de', value: 'Raum und Form' }],
        annotation: []
      }]);
    });

    it('keeps the pure text (imported, no numbering) when the field hides numbering', () => {
      const result = LegacyMetadataDownloadClass.toLegacyMetadataBlob({
        profiles: [{
          profileId: 'p1',
          order: 0,
          entries: [{
            id: 'w2',
            label: [],
            value: [{
              id: 'https://w3id.org/iqb/vocab/l3',
              text: [{ lang: 'de', value: 'Raum und Form' }],
              annotation: [{ lang: 'de', value: '1.3' }]
            }],
            valueAsText: []
          }]
        }]
      } as unknown as UnitMetadataValues, { p1: { w2: true } });

      expect(result.profiles[0].entries[0].value).toEqual([{
        id: 'https://w3id.org/iqb/vocab/l3',
        text: [{ lang: 'de', value: 'Raum und Form' }]
      }]);
    });

    it('folds annotations inside item metadata as well', () => {
      const result = LegacyMetadataDownloadClass.toLegacyMetadataBlob({
        profiles: [],
        items: [{
          id: 'item-1',
          profiles: [{
            profileId: 'p1',
            order: 0,
            entries: [{
              id: 'w4',
              label: [],
              value: [{
                id: 'https://w3id.org/iqb/vocab/l3',
                label: [{ lang: 'de', value: 'Raum und Form' }],
                annotation: [{ lang: 'de', value: '1.3' }]
              }],
              valueAsText: [{ lang: 'de', value: '1.3 Raum und Form' }]
            }]
          }]
        }]
      } as unknown as UnitMetadataValues);

      expect(result.items[0].profiles[0].entries[0].value).toEqual([{
        id: 'https://w3id.org/iqb/vocab/l3',
        label: [{ lang: 'de', value: '1.3 Raum und Form' }],
        annotation: []
      }]);
    });
  });
});
