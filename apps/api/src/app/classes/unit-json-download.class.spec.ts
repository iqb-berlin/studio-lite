import {
  ItemsMetadataValues, ProfileValues, UnitDefinitionDto, UnitSchemeDto
} from '@studio-lite-lib/api-dto';
import { ExportReportMessage, ExportReportScope } from './export-report.class';
import { UnitJsonDownloadClass } from './unit-json-download.class';

describe('UnitJsonDownloadClass', () => {
  describe('transformProfilesToMetadataValues', () => {
    it('should map internal profiles to metadata-values@3.0, emit order and drop internal-only fields', () => {
      const result = UnitJsonDownloadClass.transformProfilesToMetadataValues([{
        profileId: 'https://example.org/profile.json',
        order: 0,
        entries: [{
          id: 'iqb_author',
          label: [{ lang: 'de', value: 'Entwickler:in' }],
          value: [{ lang: 'de', value: 'Ana Maier' }],
          valueAsText: [{ lang: 'de', value: 'Ana Maier' }]
        }]
      }] as unknown as ProfileValues[]);

      expect(result).toEqual([{
        profileId: 'https://example.org/profile.json',
        order: 0,
        entries: [{
          id: 'iqb_author',
          label: [{ lang: 'de', value: 'Entwickler:in' }],
          value: [{ lang: 'de', value: 'Ana Maier' }]
        }]
      }]);
    });

    it('should omit profiles without profileId or without exportable entries', () => {
      const result = UnitJsonDownloadClass.transformProfilesToMetadataValues([
        { order: 0, entries: [{ id: 'a1', value: 'x', valueAsText: [] }] },
        { profileId: 'p1', entries: [{ id: 'empty', value: [], valueAsText: [] }] },
        { profileId: 'p2', entries: [] }
      ] as unknown as ProfileValues[]);
      expect(result).toEqual([]);
    });

    it('should map vocabulary values with text to vocabulary_entries with label', () => {
      const result = UnitJsonDownloadClass.transformProfilesToMetadataValues([{
        profileId: 'p1',
        entries: [{
          id: 'w8',
          label: [{ lang: 'de', value: 'Leitidee' }],
          value: [{ id: 'https://w3id.org/iqb/vocab/l3', text: [{ lang: 'de', value: 'Raum und Form' }] }],
          valueAsText: [{ lang: 'de', value: 'Raum und Form' }]
        }]
      }] as unknown as ProfileValues[]);

      expect(result[0].entries[0].value).toEqual([{
        id: 'https://w3id.org/iqb/vocab/l3',
        label: [{ lang: 'de', value: 'Raum und Form' }]
      }]);
    });

    it('should export the annotation (numbering) alongside the label', () => {
      const result = UnitJsonDownloadClass.transformProfilesToMetadataValues([{
        profileId: 'p1',
        entries: [{
          id: 'w9',
          label: [{ lang: 'de', value: 'Leitidee' }],
          value: [{
            id: 'https://w3id.org/iqb/vocab/l3',
            text: [{ lang: 'de', value: 'Raum und Form' }],
            annotation: [{ lang: 'de', value: '1.3' }]
          }],
          valueAsText: [{ lang: 'de', value: '1.3 Raum und Form' }]
        }]
      }] as unknown as ProfileValues[]);

      expect(result[0].entries[0].value).toEqual([{
        id: 'https://w3id.org/iqb/vocab/l3',
        label: [{ lang: 'de', value: 'Raum und Form' }],
        annotation: [{ lang: 'de', value: '1.3' }]
      }]);
    });

    it('should map string values to simple_value and skip empty strings', () => {
      const result = UnitJsonDownloadClass.transformProfilesToMetadataValues([{
        profileId: 'p1',
        entries: [
          {
            id: 'a1', label: [], value: 'true', valueAsText: { lang: 'de', value: 'ja' }
          },
          {
            id: 'a2', label: [], value: '', valueAsText: []
          }
        ]
      }] as unknown as ProfileValues[]);

      expect(result[0].entries).toEqual([{
        id: 'a1',
        value: { raw: 'true', asText: [{ lang: 'de', value: 'ja' }] }
      }]);
    });

    // metadata-values@3.x form-created shapes: the editor stores vocabulary values
    // with `label` (not the legacy `text`) and simple values as { raw, asText }
    // objects (not plain strings). The export must handle these, not just the
    // legacy shapes, or form-edited metadata is lost on JSON export.
    it('should export form-created vocabulary values that carry label (not text)', () => {
      const result = UnitJsonDownloadClass.transformProfilesToMetadataValues([{
        profileId: 'p1',
        entries: [{
          id: 'iqb_phones',
          label: [{ lang: 'de', value: 'Kopfhörereinsatz' }],
          value: [{ id: 'https://w3id.org/iqb/v24/kh/r5f', label: [{ lang: 'de', value: 'nein' }] }],
          valueAsText: []
        }]
      }] as unknown as ProfileValues[]);

      expect(result[0].entries[0].value).toEqual([{
        id: 'https://w3id.org/iqb/v24/kh/r5f',
        label: [{ lang: 'de', value: 'nein' }]
      }]);
    });

    it('should export form-created simple value objects { raw, asText } (not drop them)', () => {
      const result = UnitJsonDownloadClass.transformProfilesToMetadataValues([{
        profileId: 'p1',
        entries: [{
          id: 'a1',
          label: [{ lang: 'de', value: 'Für SPF geeignet' }],
          value: { raw: 'true', asText: [{ lang: 'de', value: 'ja' }] },
          valueAsText: []
        }]
      }] as unknown as ProfileValues[]);

      expect(result[0].entries[0].value).toEqual({ raw: 'true', asText: [{ lang: 'de', value: 'ja' }] });
    });

    // The spec requires a value: a simple value without raw value is no entry.
    it('should drop a simple value object without raw value', () => {
      const result = UnitJsonDownloadClass.transformProfilesToMetadataValues([{
        profileId: 'p1',
        entries: [
          { id: 'empty', value: { raw: '', asText: [{ lang: 'de', value: 'leer' }] }, valueAsText: [] },
          { id: 'kept', value: { raw: 'x' }, valueAsText: [{ lang: 'de', value: 'X' }] }
        ]
      }] as unknown as ProfileValues[]);

      expect(result[0].entries).toEqual([{ id: 'kept', value: { raw: 'x', asText: [{ lang: 'de', value: 'X' }] } }]);
    });

    it('should drop label and asText entries without a valid two-letter language code', () => {
      const result = UnitJsonDownloadClass.transformProfilesToMetadataValues([{
        profileId: 'p1',
        entries: [{
          id: 'a1',
          label: [{ value: 'no lang' }],
          value: 'x',
          valueAsText: [{ value: 'no lang either' }]
        }]
      }] as unknown as ProfileValues[]);

      expect(result[0].entries).toEqual([{ id: 'a1', value: { raw: 'x' } }]);
    });
  });

  describe('transformItems', () => {
    it('should map internal items to unit-items@0.2 and drop non-spec fields', () => {
      const result = UnitJsonDownloadClass.transformItems([{
        uuid: 'u1',
        id: 'ITEM1',
        description: 'Desc',
        order: 1,
        position: '01',
        locked: true,
        unitId: 12,
        weighting: 2,
        variableId: 'VAR1',
        variableReadOnlyId: 'var-uuid-1',
        createdAt: '2025-01-01T00:00:00.000Z',
        changedAt: '2025-02-01T00:00:00.000Z',
        profiles: []
      }] as unknown as ItemsMetadataValues[]);

      expect(result).toEqual([{
        uuid: 'u1',
        id: 'ITEM1',
        description: 'Desc',
        order: 1,
        sourceVariableId: 'VAR1',
        sourceVariableUuid: 'var-uuid-1',
        createdAt: '2025-01-01T00:00:00.000Z',
        changedAt: '2025-02-01T00:00:00.000Z'
      }]);
    });

    it('should skip items without id and derive order from the position in the list', () => {
      const result = UnitJsonDownloadClass.transformItems([
        { uuid: 'u1', profiles: [] },
        { uuid: 'u2', id: 'ITEM2', profiles: [] }
      ] as unknown as ItemsMetadataValues[]);

      expect(result).toEqual([{ uuid: 'u2', id: 'ITEM2', order: 1 }]);
    });

    it('should return an empty array for missing items', () => {
      expect(UnitJsonDownloadClass.transformItems(undefined)).toEqual([]);
    });
  });

  describe('export report', () => {
    const makeScope = (objectKey: string) => {
      const messages: ExportReportMessage[] = [];
      const scope = new ExportReportScope('U1', objectKey, messages);
      return { scope, messages };
    };

    it('should report texts dropped for an invalid language code', () => {
      const { scope, messages } = makeScope('U1.vomd.json');
      UnitJsonDownloadClass.transformProfilesToMetadataValues([{
        profileId: 'p1',
        entries: [{
          id: 'e1', label: [], value: [{ lang: 'de-DE', value: 'Text' }], valueAsText: []
        }]
      }] as unknown as ProfileValues[], scope);

      expect(messages).toEqual([{
        unitKey: 'U1',
        objectKey: 'U1.vomd.json',
        messageKey: 'dropped-content.invalid-language-code',
        details: {
          profileId: 'p1', entryId: 'e1', lang: 'de-DE', value: 'Text'
        }
      }]);
    });

    it('should report when plain texts are dropped from a mixed vocabulary value', () => {
      const { scope, messages } = makeScope('U1.vomd.json');
      const result = UnitJsonDownloadClass.transformProfilesToMetadataValues([{
        profileId: 'p1',
        entries: [{
          id: 'e1',
          label: [],
          value: [
            { id: 'v1', text: [{ lang: 'de', value: 'A' }] },
            { lang: 'de', value: 'B' }
          ],
          valueAsText: []
        }]
      }] as unknown as ProfileValues[], scope);

      expect(result[0].entries[0].value).toEqual([{ id: 'v1', label: [{ lang: 'de', value: 'A' }] }]);
      expect(messages).toEqual([expect.objectContaining({
        messageKey: 'dropped-content.mixed-value-dropped',
        details: { profileId: 'p1', entryId: 'e1', droppedCount: '1' }
      })]);
    });

    it('should report a profile that is dropped for a missing profileId', () => {
      const { scope, messages } = makeScope('U1.vomd.json');
      UnitJsonDownloadClass.transformProfilesToMetadataValues([{
        entries: [{
          id: 'e1', label: [], value: 'x', valueAsText: []
        }]
      }] as unknown as ProfileValues[], scope);

      expect(messages).toEqual([expect.objectContaining({
        messageKey: 'dropped-content.profile-not-exported'
      })]);
    });

    it('should report an entry with content that is dropped for a missing id', () => {
      const { scope, messages } = makeScope('U1.vomd.json');
      const result = UnitJsonDownloadClass.transformProfilesToMetadataValues([{
        profileId: 'p1',
        entries: [
          { label: [], value: 'verlorener Inhalt', valueAsText: [] },
          {
            id: 'e2', label: [], value: 'x', valueAsText: []
          }
        ]
      }] as unknown as ProfileValues[], scope);

      expect(result).toHaveLength(1);
      expect(messages).toEqual([{
        unitKey: 'U1',
        objectKey: 'U1.vomd.json',
        messageKey: 'dropped-content.entry-not-exported',
        details: { profileId: 'p1' }
      }]);
    });

    it('should not report an id-less entry without content', () => {
      const { scope, messages } = makeScope('U1.vomd.json');
      UnitJsonDownloadClass.transformProfilesToMetadataValues([{
        profileId: 'p1',
        entries: [{ label: [], value: '', valueAsText: [] }]
      }] as unknown as ProfileValues[], scope);

      expect(messages).toEqual([]);
    });

    it('should report an item that is dropped for a missing id', () => {
      const { scope, messages } = makeScope('U1.voit.json');
      UnitJsonDownloadClass.transformItems(
        [{ uuid: 'item-uuid-1', profiles: [] }] as unknown as ItemsMetadataValues[],
        scope
      );

      expect(messages).toEqual([{
        unitKey: 'U1',
        objectKey: 'U1.voit.json',
        messageKey: 'dropped-content.item-not-exported',
        details: { uuid: 'item-uuid-1' }
      }]);
    });

    it('should not report anything for clean data', () => {
      const { scope, messages } = makeScope('U1.vomd.json');
      UnitJsonDownloadClass.transformProfilesToMetadataValues([{
        profileId: 'p1',
        entries: [{
          id: 'e1', label: [{ lang: 'de', value: 'L' }], value: 'x', valueAsText: []
        }]
      }] as unknown as ProfileValues[], scope);

      expect(messages).toEqual([]);
    });
  });

  describe('buildVariablesJSON', () => {
    const unitDownloadClass = UnitJsonDownloadClass as unknown as {
      buildVariablesJSON: (
        definitionData: UnitDefinitionDto,
        schemeData: UnitSchemeDto
      ) => { baseVariables: unknown[]; derivedVariables: unknown[] } | null;
    };

    it('should return null when no variables exist', () => {
      const result = unitDownloadClass.buildVariablesJSON(
        { definition: '', variables: [] } as unknown as UnitDefinitionDto,
        { scheme: '', schemeType: '' } as unknown as UnitSchemeDto
      );
      expect(result).toBeNull();
    });

    it('should return baseVariables from definition', () => {
      const result = unitDownloadClass.buildVariablesJSON(
        {
          definition: '',
          variables: [{ id: 'v1', type: 'string' }]
        } as unknown as UnitDefinitionDto,
        { scheme: '', schemeType: '' } as unknown as UnitSchemeDto
      );
      expect(result).not.toBeNull();
      expect(result.baseVariables).toHaveLength(1);
      expect(result.derivedVariables).toHaveLength(0);
    });

    // exported as the unit XML is, in the VariableInfo 1.x spelling (#1708)
    it('should return baseVariables stored in 2.x in the 1.x spelling', () => {
      const result = unitDownloadClass.buildVariablesJSON(
        {
          definition: '',
          variables: [{ id: 'v1', type: 'NO_VALUE', format: '' }]
        } as unknown as UnitDefinitionDto,
        { scheme: '', schemeType: '' } as unknown as UnitSchemeDto
      );
      expect(result.baseVariables).toEqual([{
        id: 'v1', type: 'no-value', format: '', page: ''
      }]);
    });

    it('should set id and basedOn for derived variables, exclude BASE entries', () => {
      const result = unitDownloadClass.buildVariablesJSON(
        { definition: '', variables: [] } as unknown as UnitDefinitionDto,
        {
          scheme: JSON.stringify({
            variableCodings: [
              { id: 'b1', sourceType: 'BASE', alias: 'b1' },
              {
                id: 'd1', sourceType: 'SUM_CODE', alias: 'd1_alias', deriveSources: ['b1', 'b2']
              }
            ]
          }),
          schemeType: 'test'
        } as unknown as UnitSchemeDto
      );
      expect(result).not.toBeNull();
      expect(result.derivedVariables).toHaveLength(1);
      expect(result.derivedVariables[0]).toEqual({ id: 'd1_alias', basedOn: ['b1', 'b2'] });
    });

    it('should use empty array for basedOn when deriveSources is absent', () => {
      const result = unitDownloadClass.buildVariablesJSON(
        { definition: '', variables: [] } as unknown as UnitDefinitionDto,
        {
          scheme: JSON.stringify({
            variableCodings: [
              { id: 'd1', sourceType: 'CONCAT_CODE' }
            ]
          }),
          schemeType: 'test'
        } as unknown as UnitSchemeDto
      );
      expect(result).not.toBeNull();
      expect(result.derivedVariables[0]).toEqual({ id: 'd1', basedOn: [] });
    });
  });
});
