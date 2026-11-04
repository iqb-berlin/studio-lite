import { UnitMetadataValues } from '@studio-lite-lib/api-dto';
import { ensureValueAsText } from './metadata-value-as-text';

describe('ensureValueAsText', () => {
  it('derives valueAsText from vocabulary entries (text, not label)', () => {
    const metadata = {
      profiles: [{
        profileId: 'p1',
        entries: [{
          id: 'e1',
          label: [{ lang: 'de', value: 'Prozess' }],
          value: [{ id: 'https://w3id.org/iqb/vocab/p2', text: [{ lang: 'de', value: 'Anwenden' }] }],
          valueAsText: []
        }]
      }]
    } as unknown as UnitMetadataValues;

    const result = ensureValueAsText(metadata);

    expect(result.profiles[0].entries[0].valueAsText).toEqual([{ lang: 'de', value: 'Anwenden' }]);
  });

  it('combines the annotation (numbering) into valueAsText by default', () => {
    const metadata = {
      profiles: [{
        profileId: 'p1',
        entries: [{
          id: 'e1',
          label: [{ lang: 'de', value: 'Prozess' }],
          value: [{
            id: 'https://w3id.org/iqb/vocab/p2',
            label: [{ lang: 'de', value: 'Anwenden' }],
            annotation: [{ lang: 'de', value: '1.2' }]
          }],
          valueAsText: []
        }]
      }]
    } as unknown as UnitMetadataValues;

    const result = ensureValueAsText(metadata);

    expect(result.profiles[0].entries[0].valueAsText).toEqual([{ lang: 'de', value: '1.2 Anwenden' }]);
  });

  it('drops the numbering when the entry hideNumbering flag is set', () => {
    const metadata = {
      profiles: [{
        profileId: 'p1',
        entries: [{
          id: 'e1',
          label: [{ lang: 'de', value: 'Prozess' }],
          value: [{
            id: 'https://w3id.org/iqb/vocab/p2',
            label: [{ lang: 'de', value: 'Anwenden' }],
            annotation: [{ lang: 'de', value: '1.2' }]
          }],
          valueAsText: []
        }]
      }]
    } as unknown as UnitMetadataValues;

    const result = ensureValueAsText(metadata, { p1: { e1: true } });

    expect(result.profiles[0].entries[0].valueAsText).toEqual([{ lang: 'de', value: 'Anwenden' }]);
  });

  it('recomputes vocabulary valueAsText even when one was already stored (hideNumbering applies to imports)', () => {
    const metadata = {
      profiles: [{
        profileId: 'p1',
        entries: [{
          id: 'e1',
          label: [{ lang: 'de', value: 'Prozess' }],
          value: [{
            id: 'https://w3id.org/iqb/vocab/p2',
            text: [{ lang: 'de', value: 'Anwenden' }],
            annotation: [{ lang: 'de', value: '1.2' }]
          }],
          valueAsText: [{ lang: 'de', value: '1.2 Anwenden' }]
        }]
      }]
    } as unknown as UnitMetadataValues;

    const result = ensureValueAsText(metadata, { p1: { e1: true } });

    expect(result.profiles[0].entries[0].valueAsText).toEqual([{ lang: 'de', value: 'Anwenden' }]);
  });

  it('derives valueAsText from form-created vocabulary entries that carry label', () => {
    const metadata = {
      profiles: [{
        profileId: 'p1',
        entries: [{
          id: 'e1',
          label: [],
          value: [{ id: 'https://w3id.org/iqb/v24/kh/r5f', label: [{ lang: 'de', value: 'nein' }] }],
          valueAsText: []
        }]
      }]
    } as unknown as UnitMetadataValues;

    const result = ensureValueAsText(metadata);

    expect(result.profiles[0].entries[0].valueAsText).toEqual([{ lang: 'de', value: 'nein' }]);
  });

  it('derives valueAsText from a form-created simple value object { raw, asText }', () => {
    const metadata = {
      profiles: [{
        profileId: 'p1',
        entries: [{
          id: 'e1', label: [], value: { raw: 'true', asText: [{ lang: 'de', value: 'ja' }] }, valueAsText: []
        }]
      }]
    } as unknown as UnitMetadataValues;

    const result = ensureValueAsText(metadata);

    expect(result.profiles[0].entries[0].valueAsText).toEqual([{ lang: 'de', value: 'ja' }]);
  });

  it('tolerates a null element in a vocabulary value array without crashing', () => {
    const metadata = {
      profiles: [{
        profileId: 'p1',
        entries: [{
          id: 'e1',
          label: [],
          value: [{ id: 'v', text: [{ lang: 'de', value: 'Anwenden' }] }, null],
          valueAsText: []
        }]
      }]
    } as unknown as UnitMetadataValues;

    const result = ensureValueAsText(metadata);

    expect(result.profiles[0].entries[0].valueAsText).toEqual([{ lang: 'de', value: 'Anwenden' }]);
  });

  it('keeps multilingual free text arrays as valueAsText', () => {
    const metadata = {
      profiles: [{
        profileId: 'p1',
        entries: [{
          id: 'e1',
          label: [],
          value: [{ lang: 'de', value: 'Freitext' }],
          valueAsText: []
        }]
      }]
    } as unknown as UnitMetadataValues;

    const result = ensureValueAsText(metadata);

    expect(result.profiles[0].entries[0].valueAsText).toEqual([{ lang: 'de', value: 'Freitext' }]);
  });

  it('leaves valueAsText empty for a plain string value (not derivable)', () => {
    const metadata = {
      profiles: [{
        profileId: 'p1',
        entries: [{
          id: 'e1', label: [], value: 'false', valueAsText: []
        }]
      }]
    } as unknown as UnitMetadataValues;

    const result = ensureValueAsText(metadata);

    expect(result.profiles[0].entries[0].valueAsText).toEqual([]);
  });

  it('does not overwrite an existing valueAsText for non-vocabulary values', () => {
    // Vocabulary display text is always recomputed (so hideNumbering applies),
    // but other value types keep a stored valueAsText.
    const metadata = {
      profiles: [{
        profileId: 'p1',
        entries: [{
          id: 'e1',
          label: [],
          value: [{ lang: 'de', value: 'Neu' }],
          valueAsText: [{ lang: 'de', value: 'Alt' }]
        }]
      }]
    } as unknown as UnitMetadataValues;

    const result = ensureValueAsText(metadata);

    expect(result.profiles[0].entries[0].valueAsText).toEqual([{ lang: 'de', value: 'Alt' }]);
  });

  it('fills item profile entries and does not mutate the input', () => {
    const metadata = {
      items: [{
        id: 'ITEM1',
        profiles: [{
          profileId: 'ip1',
          entries: [{
            id: 'e1',
            label: [],
            value: [{ id: 'v', text: [{ lang: 'de', value: 'Anwenden' }] }],
            valueAsText: []
          }]
        }]
      }]
    } as unknown as UnitMetadataValues;

    const result = ensureValueAsText(metadata);

    expect(result.items[0].profiles[0].entries[0].valueAsText).toEqual([{ lang: 'de', value: 'Anwenden' }]);
    // input untouched
    expect(metadata.items[0].profiles[0].entries[0].valueAsText).toEqual([]);
  });
});
