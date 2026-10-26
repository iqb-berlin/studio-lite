import {
  mapImportedComment, mapImportedItems, mapImportedMetadata, parseCompanionJson
} from './import-companion-files';
import { FileIo } from '../interfaces/file-io.interface';

describe('import companion files', () => {
  describe('parseCompanionJson', () => {
    const fileOf = (content: string): FileIo => ({
      originalname: 'U1.vomd.json',
      mimetype: 'application/json',
      buffer: Buffer.from(content),
      fieldname: 'files',
      encoding: '7bit',
      size: content.length
    });

    it('returns the parsed content', () => {
      const report = { source: 'upload-units', messages: [] };

      expect(parseCompanionJson<{ a: number }>(fileOf('{"a":1}'), report)).toEqual({ a: 1 });
      expect(report.messages).toEqual([]);
    });

    it('reports a broken file and returns nothing', () => {
      const report = { source: 'upload-units', messages: [] };

      expect(parseCompanionJson(fileOf('{broken'), report)).toBeUndefined();
      expect(report.messages).toEqual([{
        objectKey: 'U1.vomd.json',
        messageKey: 'unit-upload.api-warning.json-parse'
      }]);
    });
  });

  describe('mapImportedComment', () => {
    it('maps spec field names (commentator/isHidden/parentComment) onto the internal DTO', () => {
      const mapped = mapImportedComment({
        id: 7,
        body: 'a comment',
        commentator: 'Jane Doe',
        parentComment: 3,
        isHidden: true,
        createdAt: '2026-04-09T13:15:10.977Z',
        changedAt: '2026-04-10T13:15:10.977Z',
        itemUuids: ['item-uuid-1']
      });

      expect(mapped).toEqual({
        id: 7,
        body: 'a comment',
        userName: 'Jane Doe',
        userId: -1,
        parentId: 3,
        hidden: true,
        createdAt: new Date('2026-04-09T13:15:10.977Z'),
        changedAt: new Date('2026-04-10T13:15:10.977Z'),
        itemUuids: ['item-uuid-1']
      });
    });

    it('falls back to legacy field names (userName/hidden/parentId)', () => {
      const mapped = mapImportedComment({
        id: 1,
        body: 'legacy',
        userName: 'Old Name',
        parentId: 5,
        hidden: true
      });

      expect(mapped.userName).toBe('Old Name');
      expect(mapped.parentId).toBe(5);
      expect(mapped.hidden).toBe(true);
    });

    it('always sets userId to -1 regardless of any exported user id', () => {
      const mapped = mapImportedComment({ id: 1, body: 'x' });

      expect(mapped.userId).toBe(-1);
    });

    it('defaults parentId to null and hidden to false when absent', () => {
      const mapped = mapImportedComment({ id: 1, body: 'root' });

      expect(mapped.parentId).toBeNull();
      expect(mapped.hidden).toBe(false);
    });
  });

  describe('mapImportedMetadata', () => {
    it('maps the unit-metadata@0.1 wrapper onto the internal profiles structure', () => {
      const mapped = mapImportedMetadata({
        changedAt: '2026-05-01T08:00:00.000Z',
        metadata: [{
          profileId: 'https://example.org/unit-profile.json',
          entries: [{
            id: 'iqb_author',
            label: [{ lang: 'de', value: 'Entwickler:in' }],
            value: [{ lang: 'de', value: 'Ana Maier' }]
          }]
        }]
      });

      expect(mapped).toEqual({
        profiles: [{
          profileId: 'https://example.org/unit-profile.json',
          entries: [{
            id: 'iqb_author',
            label: [{ lang: 'de', value: 'Entwickler:in' }],
            value: [{ lang: 'de', value: 'Ana Maier' }],
            valueAsText: [{ lang: 'de', value: 'Ana Maier' }]
          }]
        }]
      });
    });

    it('reconstructs value and valueAsText from a simple_value', () => {
      const mapped = mapImportedMetadata({
        metadata: [{
          profileId: 'p1',
          entries: [{
            id: 'a1',
            value: { raw: 'false', asText: [{ lang: 'de', value: 'nein' }] }
          }]
        }]
      });

      expect(mapped.profiles[0].entries[0]).toEqual({
        id: 'a1',
        label: [],
        value: 'false',
        valueAsText: [{ lang: 'de', value: 'nein' }]
      });
    });

    it('reconstructs internal vocabulary values ({ id, text }) from vocabulary_entries', () => {
      const mapped = mapImportedMetadata({
        metadata: [{
          profileId: 'p1',
          entries: [{
            id: 'w4',
            value: [{ id: 'https://w3id.org/iqb/vocab/p2', label: [{ lang: 'de', value: 'Anwenden' }] }]
          }]
        }]
      });

      expect(mapped.profiles[0].entries[0]).toEqual({
        id: 'w4',
        label: [],
        value: [{
          id: 'https://w3id.org/iqb/vocab/p2', text: [{ lang: 'de', value: 'Anwenden' }], annotation: []
        }],
        // vocabulary valueAsText is recomputed on read, not at import time
        valueAsText: []
      });
    });

    it('preserves the annotation (numbering) in the value; valueAsText is filled on read', () => {
      const mapped = mapImportedMetadata({
        metadata: [{
          profileId: 'p1',
          entries: [{
            id: 'w5',
            value: [{
              id: 'https://w3id.org/iqb/vocab/p2',
              label: [{ lang: 'de', value: 'Anwenden' }],
              annotation: [{ lang: 'de', value: '1.2' }]
            }]
          }]
        }]
      });

      expect(mapped.profiles[0].entries[0]).toEqual({
        id: 'w5',
        label: [],
        value: [{
          id: 'https://w3id.org/iqb/vocab/p2',
          text: [{ lang: 'de', value: 'Anwenden' }],
          annotation: [{ lang: 'de', value: '1.2' }]
        }],
        // recomputed by ensureValueAsText on read (see metadata-value-as-text.spec)
        valueAsText: []
      });
    });

    it('normalizes a legacy raw { profiles, items } blob, deriving order from isCurrent', () => {
      const legacy = {
        profiles: [
          { profileId: 'p1', isCurrent: true, entries: [] },
          { profileId: 'p2', isCurrent: false, entries: [] }
        ],
        items: [{ id: 'ITEM1', profiles: [{ profileId: 'ip1', isCurrent: true, entries: [] }] }]
      };

      expect(mapImportedMetadata(legacy)).toEqual({
        profiles: [
          { profileId: 'p1', order: 0, entries: [] },
          { profileId: 'p2', order: -1, entries: [] }
        ],
        items: [{ id: 'ITEM1', profiles: [{ profileId: 'ip1', order: 0, entries: [] }] }]
      });
    });

    it('keeps an explicit order on a legacy profile instead of deriving from isCurrent', () => {
      const legacy = {
        profiles: [{
          profileId: 'p1', order: 2, isCurrent: false, entries: []
        }],
        items: []
      };

      expect(mapImportedMetadata(legacy)).toEqual({
        profiles: [{ profileId: 'p1', order: 2, entries: [] }],
        items: []
      });
    });

    // Profile ids are deliberately NOT rewritten here: UnitMetadataService.setCurrentProfiles
    // canonicalizes them on the way to persistence, and the profile_id column
    // transformer backstops every writer (#1570).
    it('passes imported profile ids through unchanged', () => {
      const github = 'https://raw.githubusercontent.com/iqb-vocabs/p11/master/unit.json';
      const mapped = mapImportedMetadata({
        metadata: [{ profileId: github, entries: [] }]
      });

      expect(mapped.profiles[0].profileId).toBe(github);
    });
  });

  describe('mapImportedItems', () => {
    it('maps unit-items@0.2 items onto the internal structure', () => {
      const mapped = mapImportedItems([{
        uuid: 'item-uuid-1',
        id: 'ITEM1',
        description: 'Notiz',
        order: 3,
        sourceVariableId: 'VAR1',
        sourceVariableUuid: 'var-uuid-1',
        changedAt: '2026-04-01T00:00:00.000Z',
        metadata: [{
          profileId: 'https://example.org/item-profile.json',
          entries: [{
            id: 'w4',
            label: [{ lang: 'de', value: 'Prozess' }],
            value: [{ lang: 'de', value: 'Anwenden' }]
          }]
        }]
      }]);

      expect(mapped).toEqual([{
        uuid: 'item-uuid-1',
        id: 'ITEM1',
        description: 'Notiz',
        order: 3,
        variableId: 'VAR1',
        variableReadOnlyId: 'var-uuid-1',
        createdAt: undefined,
        changedAt: new Date('2026-04-01T00:00:00.000Z'),
        profiles: [{
          profileId: 'https://example.org/item-profile.json',
          entries: [{
            id: 'w4',
            label: [{ lang: 'de', value: 'Prozess' }],
            value: [{ lang: 'de', value: 'Anwenden' }],
            valueAsText: [{ lang: 'de', value: 'Anwenden' }]
          }]
        }]
      }]);
    });

    it('defaults missing source variables to null', () => {
      const mapped = mapImportedItems([{ id: 'ITEM1' }]);

      expect(mapped[0].variableId).toBeNull();
      expect(mapped[0].variableReadOnlyId).toBeNull();
    });

    it('drops items without the required id', () => {
      const mapped = mapImportedItems([
        { uuid: 'item-uuid-1' } as never,
        { id: 'ITEM1' }
      ]);

      expect(mapped).toHaveLength(1);
      expect(mapped[0].id).toBe('ITEM1');
    });
  });
});
