import { UnitImportData } from './unit-import-data.class';
import { FileIo } from '../interfaces/file-io.interface';

describe('UnitImportData', () => {
  const xmlContent = `
    <Unit>
      <Metadata lastChange="2023-01-01T12:00:00Z">
        <Id>UNIT01</Id>
        <Label>Unit Label</Label>
        <Description>Unit Description</Description>
        <Reference>unit01.vomd</Reference>
        <Transcript>Transcript Content</Transcript>
      </Metadata>
      <DefinitionRef player="player-v1" editor="editor-v1">unit01.voud</DefinitionRef>
      <BaseVariables>
        <Variable id="V1" alias="VAR1" type="string" format="text" nullable="true" multiple="false" page="1">
          <Values complete="true">
            <Value><label>L1</label><value>1</value></Value>
          </Values>
        </Variable>
      </BaseVariables>
      <CodingSchemeRef schemer="schemer-v1" schemetype="type1">unit01.vocs</CodingSchemeRef>
      <UnitCommentsRef>unit01.vouc</UnitCommentsRef>
    </Unit>
  `;

  const fileIoMock = {
    originalname: 'folder/unit01.xml',
    buffer: Buffer.from(xmlContent)
  } as unknown as FileIo;

  it('should parse metadata correctly from XML', () => {
    const data = new UnitImportData(fileIoMock);

    expect(data.key).toBe('UNIT01');
    expect(data.name).toBe('Unit Label');
    expect(data.description).toBe('Unit Description');
    expect(data.lastChangedMetadata).toEqual(new Date('2023-01-01T12:00:00Z'));
  });

  it('should parse references correctly', () => {
    const data = new UnitImportData(fileIoMock);

    expect(data.definitionFileName).toBe('folder/unit01.voud');
    expect(data.codingSchemeFileName).toBe('folder/unit01.vocs');
    expect(data.commentsFileName).toBe('folder/unit01.vouc');
    expect(data.metadataFileName).toBe('folder/unit01.vomd');
  });

  it('should parse base variables correctly', () => {
    const data = new UnitImportData(fileIoMock);

    expect(data.baseVariables).toHaveLength(1);
    expect(data.baseVariables[0].id).toBe('V1');
    expect(data.baseVariables[0].alias).toBe('VAR1');
    expect(data.baseVariables[0].values).toEqual([{ label: 'L1', value: '1' }]);
  });

  it('should throw error if metadata is missing', () => {
    const invalidFile = {
      originalname: 'test.xml',
      buffer: Buffer.from('<Invalid></Invalid>')
    } as unknown as FileIo;

    expect(() => new UnitImportData(invalidFile)).toThrow('metadata element missing');
  });

  describe('getFolder', () => {
    it('should return folder path if present', () => {
      const data = new UnitImportData(fileIoMock);
      const unitImportData = data as unknown as { getFolder: () => string };
      expect(unitImportData.getFolder()).toBe('folder/');
    });

    it('should return empty string if no folder is present', () => {
      const data = new UnitImportData({
        originalname: 'unit01.xml',
        buffer: Buffer.from(xmlContent)
      } as unknown as FileIo);
      const unitImportData = data as unknown as { getFolder: () => string };
      expect(unitImportData.getFolder()).toBe('');
    });
  });
});
