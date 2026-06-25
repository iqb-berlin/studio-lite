import { createMock } from '@golevelup/ts-jest';
import { UnitImportJsonData } from './unit-import-json-data.class';
import { FileIo } from '../interfaces/file-io.interface';

describe('UnitImportJsonData', () => {
  const buildIndex = (overrides: object = {}) => JSON.stringify({
    id: 'UNIT01',
    uuid: 'some-uuid',
    modifiedAt: '2023-01-01T12:00:00Z',
    label: 'Unit Label',
    description: 'Unit Description',
    userInterface: {
      player: 'iqb-player-aspect@2.0',
      editor: 'iqb-editor-aspect@2.0',
      definition: 'UNIT01.voud',
      isDefinitionInline: false,
      modifiedAt: '2023-01-02T10:00:00Z'
    },
    codingScheme: { id: 'UNIT01.vocs.json', type: 'iqb-coding-scheme', modifiedAt: '2023-01-03T08:00:00Z' },
    comments: { id: 'UNIT01.voco.json', type: 'iqb-unit-comments' },
    richNotes: { id: 'UNIT01.vorn.json', type: 'iqb-unit-rich-notes' },
    metadata: { id: 'UNIT01.vomd.json', type: 'metadata-values' },
    variables: { id: 'UNIT01.vova.json', type: 'unit-variables' },
    ...overrides
  });

  const fileIoMock = createMock<FileIo>({
    originalname: 'folder/UNIT01.json',
    buffer: Buffer.from(buildIndex())
  });

  it('should parse key, name and description from JSON index', () => {
    const data = new UnitImportJsonData(fileIoMock);

    expect(data.key).toBe('UNIT01');
    expect(data.name).toBe('Unit Label');
    expect(data.description).toBe('Unit Description');
  });

  it('should parse player and editor from userInterface', () => {
    const data = new UnitImportJsonData(fileIoMock);

    expect(data.player).toBe('iqb-player-aspect@2.0');
    expect(data.editor).toBe('iqb-editor-aspect@2.0');
  });

  it('should resolve file references with folder prefix', () => {
    const data = new UnitImportJsonData(fileIoMock);

    expect(data.definitionFileName).toBe('folder/UNIT01.voud');
    expect(data.codingSchemeFileName).toBe('folder/UNIT01.vocs.json');
    expect(data.commentsFileName).toBe('folder/UNIT01.voco.json');
    expect(data.richNotesFileName).toBe('folder/UNIT01.vorn.json');
    expect(data.metadataFileName).toBe('folder/UNIT01.vomd.json');
    expect(data.variablesFileName).toBe('folder/UNIT01.vova.json');
  });

  it('should resolve file references without folder prefix for root-level files', () => {
    const rootFile = createMock<FileIo>({
      originalname: 'UNIT01.json',
      buffer: Buffer.from(buildIndex())
    });
    const data = new UnitImportJsonData(rootFile);

    expect(data.definitionFileName).toBe('UNIT01.voud');
    expect(data.codingSchemeFileName).toBe('UNIT01.vocs.json');
  });

  it('should parse modifiedAt dates', () => {
    const data = new UnitImportJsonData(fileIoMock);

    expect(data.lastChangedMetadata).toEqual(new Date('2023-01-01T12:00:00Z'));
    expect(data.lastChangedDefinition).toEqual(new Date('2023-01-02T10:00:00Z'));
    expect(data.lastChangedScheme).toEqual(new Date('2023-01-03T08:00:00Z'));
  });

  it('should set empty string file references when optional blocks are absent', () => {
    const minimal = createMock<FileIo>({
      originalname: 'UNIT01.json',
      buffer: Buffer.from(buildIndex({
        codingScheme: undefined,
        comments: undefined,
        richNotes: undefined,
        metadata: undefined,
        variables: undefined
      }))
    });
    const data = new UnitImportJsonData(minimal);

    expect(data.codingSchemeFileName).toBe('');
    expect(data.commentsFileName).toBe('');
    expect(data.richNotesFileName).toBe('');
    expect(data.metadataFileName).toBe('');
    expect(data.variablesFileName).toBe('');
  });

  it('should throw error if id is missing', () => {
    const invalid = createMock<FileIo>({
      originalname: 'UNIT01.json',
      buffer: Buffer.from(JSON.stringify({ userInterface: { player: '' } }))
    });

    expect(() => new UnitImportJsonData(invalid)).toThrow('unit id missing');
  });

  it('should throw error if userInterface is missing', () => {
    const invalid = createMock<FileIo>({
      originalname: 'UNIT01.json',
      buffer: Buffer.from(JSON.stringify({ id: 'UNIT01' }))
    });

    expect(() => new UnitImportJsonData(invalid)).toThrow('userInterface missing');
  });

  it('should default transcript, reference, schemer and schemeType to empty string', () => {
    const data = new UnitImportJsonData(fileIoMock);

    expect(data.transcript).toBe('');
    expect(data.reference).toBe('');
    expect(data.schemer).toBe('');
    expect(data.schemeType).toBe('');
  });
});
