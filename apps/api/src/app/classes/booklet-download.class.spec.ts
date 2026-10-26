import { createMock } from '@golevelup/ts-jest';
import {
  UnitDownloadBookletSettingsDto, UnitDownloadSettingsDto, UnitExportConfigDto, UnitPropertiesDto
} from '@studio-lite-lib/api-dto';
import type AdmZip from 'adm-zip';
import { BookletDownloadClass } from './booklet-download.class';

describe('BookletDownloadClass', () => {
  let mockZip: {
    addFile: jest.Mock;
    toBuffer: jest.Mock;
  };

  beforeEach(() => {
    mockZip = {
      addFile: jest.fn(),
      toBuffer: jest.fn().mockReturnValue(Buffer.from('zip-content'))
    };
  });

  describe('generateCodeList', () => {
    it('should generate requested number of unique codes', () => {
      const result = BookletDownloadClass.generateCodeList(5, 10);
      expect(result).toHaveLength(10);
      const uniqueCodes = new Set(result);
      expect(uniqueCodes.size).toBe(10);
    });
  });

  describe('safeBookletId', () => {
    it('should return booklet1 when input is undefined', () => {
      expect(BookletDownloadClass.safeBookletId(undefined)).toBe('booklet1');
    });

    it('should return booklet1 when input is empty string', () => {
      expect(BookletDownloadClass.safeBookletId('')).toBe('booklet1');
    });

    it('should return the value unchanged when it contains only safe characters', () => {
      expect(BookletDownloadClass.safeBookletId('myBooklet-1_A')).toBe('myBooklet-1_A');
    });

    it('should replace path separators and unsafe characters with underscores', () => {
      expect(BookletDownloadClass.safeBookletId('../../evil')).toBe('______evil');
    });
  });

  describe('createBookletXml', () => {
    const exportConfig = createMock<UnitExportConfigDto>({ bookletXsdUrl: 'booklet.xsd' });

    it('should use default Id and empty Label when no args provided', () => {
      const xml = BookletDownloadClass.createBookletXml(exportConfig).toString();
      expect(xml).toContain('<Id>booklet1</Id>');
      expect(xml).toContain('<Label/>');
    });

    it('should use custom Id and Label when provided', () => {
      const xml = BookletDownloadClass.createBookletXml(exportConfig, 'myStudy', 'Mein Testheft').toString();
      expect(xml).toContain('<Id>myStudy</Id>');
      expect(xml).toContain('<Label>Mein Testheft</Label>');
    });
  });

  describe('addBooklet', () => {
    const exportConfig = createMock<UnitExportConfigDto>({ bookletXsdUrl: 'booklet.xsd' });
    const units: UnitPropertiesDto[] = [
      createMock<UnitPropertiesDto>({ key: 'unit1', name: 'Aufgabe A' }),
      createMock<UnitPropertiesDto>({ key: 'unit2', name: '' })
    ];

    it('should write booklet1.xml when bookletId is not set', () => {
      const settings = createMock<UnitDownloadSettingsDto>({ bookletId: undefined, bookletSettings: [] });
      BookletDownloadClass.addBooklet(exportConfig, settings, units, mockZip as unknown as AdmZip);
      expect(mockZip.addFile).toHaveBeenCalledWith(
        'booklet1.xml',
        expect.any(Buffer)
      );
    });

    it('should write <bookletId>.xml when bookletId is set', () => {
      const settings = createMock<UnitDownloadSettingsDto>({ bookletId: 'studie2025', bookletSettings: [] });
      BookletDownloadClass.addBooklet(exportConfig, settings, units, mockZip as unknown as AdmZip);
      expect(mockZip.addFile).toHaveBeenCalledWith('studie2025.xml', expect.any(Buffer));
    });

    it('should sanitize bookletId used as filename', () => {
      const settings = createMock<UnitDownloadSettingsDto>({ bookletId: 'a/b', bookletSettings: [] });
      BookletDownloadClass.addBooklet(exportConfig, settings, units, mockZip as unknown as AdmZip);
      expect(mockZip.addFile).toHaveBeenCalledWith('a_b.xml', expect.any(Buffer));
    });

    it('should write an empty label when bookletLabel is not set', () => {
      const settings = createMock<UnitDownloadSettingsDto>(
        { bookletId: undefined, bookletLabel: undefined, bookletSettings: [] }
      );
      BookletDownloadClass.addBooklet(exportConfig, settings, units, mockZip as unknown as AdmZip);
      const xmlContent = (mockZip.addFile.mock.calls[0][1] as Buffer).toString();
      expect(xmlContent).toContain('<Label/>');
    });

    it('should use provided bookletLabel in the XML', () => {
      const settings = createMock<UnitDownloadSettingsDto>(
        { bookletId: undefined, bookletLabel: 'Mein Test', bookletSettings: [] }
      );
      BookletDownloadClass.addBooklet(exportConfig, settings, units, mockZip as unknown as AdmZip);
      const xmlContent = (mockZip.addFile.mock.calls[0][1] as Buffer).toString();
      expect(xmlContent).toContain('<Label>Mein Test</Label>');
    });

    it('should use unit index as labelshort', () => {
      const settings = createMock<UnitDownloadSettingsDto>({ bookletId: undefined, bookletSettings: [] });
      BookletDownloadClass.addBooklet(exportConfig, settings, units, mockZip as unknown as AdmZip);
      const xmlContent = (mockZip.addFile.mock.calls[0][1] as Buffer).toString();
      expect(xmlContent).toContain('labelshort="1"');
      expect(xmlContent).toContain('labelshort="2"');
    });
  });

  describe('addTestTakers', () => {
    const exportConfig = createMock<UnitExportConfigDto>(
      { bookletXsdUrl: 'booklet.xsd', testTakersXsdUrl: 'testtakers.xsd' }
    );

    const baseSettings: Partial<UnitDownloadSettingsDto> = {
      bookletId: undefined,
      groupLabel: undefined,
      monitorBookletVisibility: undefined,
      addTestTakersReview: 1,
      addTestTakersHot: 0,
      addTestTakersMonitor: 0,
      passwordLess: true,
      bookletSettings: [] as UnitDownloadBookletSettingsDto[]
    };

    it('should write booklet1_testtaker.xml when bookletId is not set', () => {
      const settings = createMock<UnitDownloadSettingsDto>({ ...baseSettings });
      BookletDownloadClass.addTestTakers(exportConfig, settings, 1, mockZip as unknown as AdmZip);
      expect(mockZip.addFile).toHaveBeenCalledWith('booklet1_testtaker.xml', expect.any(Buffer));
    });

    it('should write <bookletId>_testtaker.xml when bookletId is set', () => {
      const settings = createMock<UnitDownloadSettingsDto>({ ...baseSettings, bookletId: 'studie2025' });
      BookletDownloadClass.addTestTakers(exportConfig, settings, 1, mockZip as unknown as AdmZip);
      expect(mockZip.addFile).toHaveBeenCalledWith('studie2025_testtaker.xml', expect.any(Buffer));
    });

    it('should reference booklet1 in testtaker XML when no bookletId is set', () => {
      const settings = createMock<UnitDownloadSettingsDto>({ ...baseSettings });
      BookletDownloadClass.addTestTakers(exportConfig, settings, 1, mockZip as unknown as AdmZip);
      const xmlContent = (mockZip.addFile.mock.calls[0][1] as Buffer).toString();
      expect(xmlContent).toContain('>booklet1<');
    });

    it('should reference custom bookletId in testtaker XML', () => {
      const settings = createMock<UnitDownloadSettingsDto>({ ...baseSettings, bookletId: 'studie2025' });
      BookletDownloadClass.addTestTakers(exportConfig, settings, 1, mockZip as unknown as AdmZip);
      const xmlContent = (mockZip.addFile.mock.calls[0][1] as Buffer).toString();
      expect(xmlContent).toContain('>studie2025<');
    });

    it('should use bookletId_group as group id', () => {
      const settings = createMock<UnitDownloadSettingsDto>({ ...baseSettings, bookletId: 'studie2025' });
      BookletDownloadClass.addTestTakers(exportConfig, settings, 1, mockZip as unknown as AdmZip);
      const xmlContent = (mockZip.addFile.mock.calls[0][1] as Buffer).toString();
      expect(xmlContent).toContain('id="studie2025_group"');
    });

    it('should use booklet1_group as group id when bookletId is not set', () => {
      const settings = createMock<UnitDownloadSettingsDto>({ ...baseSettings });
      BookletDownloadClass.addTestTakers(exportConfig, settings, 1, mockZip as unknown as AdmZip);
      const xmlContent = (mockZip.addFile.mock.calls[0][1] as Buffer).toString();
      expect(xmlContent).toContain('id="booklet1_group"');
    });

    it('should use groupLabel in group label attribute', () => {
      const settings = createMock<UnitDownloadSettingsDto>({ ...baseSettings, groupLabel: 'Meine Gruppe' });
      BookletDownloadClass.addTestTakers(exportConfig, settings, 1, mockZip as unknown as AdmZip);
      const xmlContent = (mockZip.addFile.mock.calls[0][1] as Buffer).toString();
      expect(xmlContent).toContain('label="Meine Gruppe"');
    });

    it('should write an empty group label when groupLabel is not set', () => {
      const settings = createMock<UnitDownloadSettingsDto>({ ...baseSettings });
      BookletDownloadClass.addTestTakers(exportConfig, settings, 1, mockZip as unknown as AdmZip);
      const xmlContent = (mockZip.addFile.mock.calls[0][1] as Buffer).toString();
      expect(xmlContent).toContain('label=""');
    });

    it('should not include CustomTexts in testtaker XML', () => {
      const settings = createMock<UnitDownloadSettingsDto>({ ...baseSettings });
      BookletDownloadClass.addTestTakers(exportConfig, settings, 1, mockZip as unknown as AdmZip);
      const xmlContent = (mockZip.addFile.mock.calls[0][1] as Buffer).toString();
      expect(xmlContent).not.toContain('CustomText');
      expect(xmlContent).not.toContain('login_testEndButtonLabel');
    });

    it('should write ViewSettings with monitorBookletVisibility for monitor login', () => {
      const settings = createMock<UnitDownloadSettingsDto>({
        ...baseSettings,
        addTestTakersReview: 0,
        addTestTakersMonitor: 1,
        monitorBookletVisibility: 'collapsed'
      });
      BookletDownloadClass.addTestTakers(exportConfig, settings, 1, mockZip as unknown as AdmZip);
      const xmlContent = (mockZip.addFile.mock.calls[0][1] as Buffer).toString();
      expect(xmlContent).toContain('ViewSettings');
      expect(xmlContent).toContain('collapsed');
    });

    it('should not write ViewSettings when monitorBookletVisibility is not set', () => {
      const settings = createMock<UnitDownloadSettingsDto>({
        ...baseSettings,
        addTestTakersReview: 0,
        addTestTakersMonitor: 1
      });
      BookletDownloadClass.addTestTakers(exportConfig, settings, 1, mockZip as unknown as AdmZip);
      const xmlContent = (mockZip.addFile.mock.calls[0][1] as Buffer).toString();
      expect(xmlContent).not.toContain('ViewSettings');
    });

    it('should not include Booklet element in monitor login', () => {
      const settings = createMock<UnitDownloadSettingsDto>({
        ...baseSettings,
        addTestTakersReview: 0,
        addTestTakersMonitor: 1
      });
      BookletDownloadClass.addTestTakers(exportConfig, settings, 1, mockZip as unknown as AdmZip);
      const xmlContent = (mockZip.addFile.mock.calls[0][1] as Buffer).toString();
      expect(xmlContent).not.toContain('<Booklet>');
    });
  });
});
