import { createMock } from '@golevelup/ts-jest';
import { UnitImportData } from './unit-import-data.class';
import { NotAUnitXmlError } from '../exceptions/not-a-unit-xml.error';
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
      <CodingSchemeRef schemer="schemer-v1" schemeType="type1">unit01.vocs</CodingSchemeRef>
      <UnitCommentsRef>unit01.vouc</UnitCommentsRef>
      <UnitRichNotesRef>unit01.vorn</UnitRichNotesRef>
    </Unit>
  `;

  const fileIoMock = createMock<FileIo>({
    originalname: 'folder/unit01.xml',
    buffer: Buffer.from(xmlContent)
  });

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
    expect(data.richNotesFileName).toBe('folder/unit01.vorn');
    expect(data.metadataFileName).toBe('folder/unit01.vomd');
  });

  // unit-xml writes `schemeType`, and the parser in XML mode tells it from `schemetype` (#1759).
  describe('coding scheme type', () => {
    const unitXml = (schemeRef: string) => createMock<FileIo>({
      originalname: 'unit01.xml',
      buffer: Buffer.from(`<Unit><Metadata><Id>UNIT01</Id><Label>L</Label></Metadata>${schemeRef}</Unit>`)
    });

    it('should read schemer and scheme type as the export writes them', () => {
      const data = new UnitImportData(fileIoMock);

      expect(data.schemer).toBe('schemer-v1');
      expect(data.schemeType).toBe('type1');
    });

    it('should still read a scheme type written in lower case', () => {
      const data = new UnitImportData(unitXml(
        '<CodingSchemeRef schemer="s@1.0" schemetype="iqb-standard@3.0">unit01.vocs</CodingSchemeRef>'
      ));

      expect(data.schemeType).toBe('iqb-standard@3.0');
    });

    it('should leave the scheme type undefined when the file gives none', () => {
      const data = new UnitImportData(unitXml('<CodingSchemeRef schemer="s@1.0">unit01.vocs</CodingSchemeRef>'));

      expect(data.schemeType).toBeUndefined();
    });
  });

  describe('definition type (#1368)', () => {
    const unitXml = (definitionElement: string) => createMock<FileIo>({
      originalname: 'unit01.xml',
      buffer: Buffer.from(`<Unit><Metadata><Id>UNIT01</Id><Label>L</Label></Metadata>${definitionElement}</Unit>`)
    });

    it('should read the type of a referenced definition', () => {
      const data = new UnitImportData(unitXml(
        '<DefinitionRef player="p@1.0" type="aspect-unit-definition@4.12.0">unit01.voud</DefinitionRef>'
      ));

      expect(data.definitionType).toBe('aspect-unit-definition@4.12.0');
    });

    it('should read the type of an inline definition', () => {
      const data = new UnitImportData(unitXml(
        '<Definition player="p@1.0" type="aspect-unit-definition@4.12.0">{}</Definition>'
      ));

      expect(data.definitionType).toBe('aspect-unit-definition@4.12.0');
    });

    it('should leave the type empty when the file does not give one', () => {
      expect(new UnitImportData(fileIoMock).definitionType).toBe('');
    });
  });

  it('should parse base variables correctly', () => {
    const data = new UnitImportData(fileIoMock);

    expect(data.baseVariables).toHaveLength(1);
    expect(data.baseVariables[0].id).toBe('V1');
    expect(data.baseVariables[0].alias).toBe('VAR1');
    expect(data.baseVariables[0].values).toEqual([{ label: 'L1', value: '1' }]);
  });

  it('should throw error if metadata is missing', () => {
    const invalidFile = createMock<FileIo>({
      originalname: 'test.xml',
      buffer: Buffer.from('<Unit></Unit>')
    });

    expect(() => new UnitImportData(invalidFile)).toThrow('metadata element missing');
  });

  it('should read a unit behind an XML declaration', () => {
    const data = new UnitImportData(createMock<FileIo>({
      originalname: 'unit01.xml',
      buffer: Buffer.from(`<?xml version="1.0"?>\n${xmlContent}`)
    }));

    expect(data.key).toBe('UNIT01');
  });

  describe('files that are not a unit (#1710)', () => {
    const load = (xml: string) => () => new UnitImportData(createMock<FileIo>({
      originalname: 'export.zip/file.xml',
      buffer: Buffer.from(xml)
    }));
    const thrownBy = (xml: string): NotAUnitXmlError => {
      try {
        load(xml)();
      } catch (error) {
        return error as NotAUnitXmlError;
      }
      throw new Error('nothing thrown');
    };

    // The booklet the export writes has <Metadata><Id> just like a unit and was imported as one
    it('should refuse the exported booklet although it carries a unit-like id', () => {
      const booklet = `<?xml version="1.0"?>
        <Booklet><Metadata><Id>booklet1</Id><Label/></Metadata><Units><Unit id="U1"/></Units></Booklet>`;

      expect(load(booklet)).toThrow(NotAUnitXmlError);
      expect(thrownBy(booklet).rootElement).toBe('Booklet');
      expect(thrownBy(booklet).isTestcenterFile).toBe(true);
    });

    it('should recognise the exported test-taker file as a Testcenter file', () => {
      const error = thrownBy('<?xml version="1.0"?><Testtakers><Metadata/><Group id="g"/></Testtakers>');

      expect(error.isTestcenterFile).toBe(true);
    });

    it('should not take any other root element for a Testcenter file', () => {
      const error = thrownBy('<Something><Metadata><Id>X</Id></Metadata></Something>');

      expect(error).toBeInstanceOf(NotAUnitXmlError);
      expect(error.rootElement).toBe('Something');
      expect(error.isTestcenterFile).toBe(false);
    });
  });

  it('should not resolve empty companion references to a bare folder', () => {
    // An empty <CodingSchemeRef/> (and an empty metadata <Reference/>) means the
    // unit points at no companion file. It must yield '' rather than the folder
    // prefix, otherwise the import reports a missing file that was never referenced.
    const emptyRefsXml = `
      <Unit>
        <Metadata lastChange="2023-01-01T12:00:00Z">
          <Id>UNIT02</Id>
          <Label>Unit Label</Label>
          <Reference/>
        </Metadata>
        <CodingSchemeRef schemer="schemer-v1"/>
        <UnitCommentsRef/>
        <UnitRichNotesRef/>
      </Unit>
    `;
    const data = new UnitImportData(createMock<FileIo>({
      originalname: 'folder/unit02.xml',
      buffer: Buffer.from(emptyRefsXml)
    }));

    expect(data.codingSchemeFileName).toBe('');
    expect(data.metadataFileName).toBe('');
    expect(data.commentsFileName).toBe('');
    expect(data.richNotesFileName).toBe('');
    expect(data.definitionFileName).toBe('');
  });

  it('should resolve references relative to a nested folder path', () => {
    const data = new UnitImportData(createMock<FileIo>({
      originalname: 'bundle.zip/sub/unit01.xml',
      buffer: Buffer.from(xmlContent)
    }));

    expect(data.definitionFileName).toBe('bundle.zip/sub/unit01.voud');
    expect(data.codingSchemeFileName).toBe('bundle.zip/sub/unit01.vocs');
    expect(data.metadataFileName).toBe('bundle.zip/sub/unit01.vomd');
  });

  describe('getFolder', () => {
    it('should return folder path if present', () => {
      const data = new UnitImportData(fileIoMock);
      const unitImportData = data as unknown as { getFolder: () => string };
      expect(unitImportData.getFolder()).toBe('folder/');
    });

    it('should return empty string if no folder is present', () => {
      const data = new UnitImportData(createMock<FileIo>({
        originalname: 'unit01.xml',
        buffer: Buffer.from(xmlContent)
      }));
      const unitImportData = data as unknown as { getFolder: () => string };
      expect(unitImportData.getFolder()).toBe('');
    });
  });
});
