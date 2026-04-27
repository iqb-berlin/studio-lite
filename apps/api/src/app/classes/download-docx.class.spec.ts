import {
  CodebookUnitDto,
  CodeBookContentSetting
} from '@studio-lite-lib/api-dto';
import { Packer } from 'docx';
import * as imageSizeModule from 'image-size';
import { DownloadDocx } from './download-docx.class';

jest.mock('docx', () => ({
  Packer: {
    toBase64String: jest.fn().mockResolvedValue('base64string')
  },
  Paragraph: jest.fn(),
  TextRun: jest.fn(),
  Document: jest.fn(),
  HeadingLevel: { HEADING_1: 1, HEADING_2: 2, HEADING_3: 3 },
  AlignmentType: {
    CENTER: 'center',
    LEFT: 'left',
    RIGHT: 'right',
    JUSTIFIED: 'justify'
  },
  Footer: jest.fn(),
  Table: jest.fn(),
  TableRow: jest.fn(),
  TableCell: jest.fn(),
  WidthType: { PERCENTAGE: 'pct' },
  PageNumber: { CURRENT: 'current', TOTAL_PAGES: 'total' },
  ImageRun: jest.fn(),
  NumberFormat: { DECIMAL: 'decimal' },
  ImportedXmlComponent: {
    fromXmlString: jest.fn().mockReturnValue({})
  }
}));

jest.mock('image-size');

jest.mock('katex', () => ({
  renderToString: jest.fn().mockReturnValue('<math>mocked-mathml</math>')
}));

jest.mock('mathml2omml', () => ({
  mml2omml: jest.fn().mockReturnValue('<oml:mocked-omml/>')
}));

describe('DownloadDocx', () => {
  describe('getDocXCodebook', () => {
    it('should return a buffer when units are provided', async () => {
      const units = [
        {
          key: 'U1',
          name: 'Unit 1',
          variables: [],
          missings: [],
          items: []
        }
      ] as unknown as CodebookUnitDto[];
      const settings = {
        hasOnlyVarsWithCodes: false
      } as unknown as CodeBookContentSetting;

      const result = await DownloadDocx.getDocXCodebook(units, settings);

      expect(Buffer.isBuffer(result)).toBe(true);
      expect((result as Buffer).toString('base64')).toBe('base64string');
      expect(Packer.toBase64String).toHaveBeenCalled();
    });

    it('should return empty array when no units are provided', async () => {
      const result = await DownloadDocx.getDocXCodebook(
        [],
        {} as unknown as CodeBookContentSetting
      );
      expect(result).toEqual([]);
    });
  });

  describe('htmlToDocx', () => {
    it('should convert simple HTML to docx elements', () => {
      const html = '<p>Hello <strong>World</strong></p>';
      const settings = {} as unknown as CodeBookContentSetting;
      // Accessing private method for testing via unknown casting
      const result = (
        DownloadDocx as unknown as {
          htmlToDocx: (
            html: string,
            settings: CodeBookContentSetting
          ) => unknown[];
        }
      ).htmlToDocx(html, settings);

      expect(result).toHaveLength(1);
    });

    it('should handle images in HTML', () => {
      const html =
        '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJ' +
        'AAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==" alt="">';
      const settings = {
        showScore: false
      } as unknown as CodeBookContentSetting;

      (imageSizeModule.imageSize as jest.Mock).mockReturnValue({
        width: 100,
        height: 100
      });

      const result = (
        DownloadDocx as unknown as {
          htmlToDocx: (
            html: string,
            settings: CodeBookContentSetting
          ) => unknown[];
        }
      ).htmlToDocx(html, settings);
      expect(result).toHaveLength(1);
    });

    it('should handle math formulas in HTML', () => {
      const html =
        '<p>Formula: <span class="iqb-math-formula" data-latex="x^2%2By^2%3Dz^2"></span></p>';
      const settings = {} as unknown as CodeBookContentSetting;

      const result = (
        DownloadDocx as unknown as {
          htmlToDocx: (
            html: string,
            settings: CodeBookContentSetting
          ) => unknown[];
        }
      ).htmlToDocx(html, settings);

      expect(result).toHaveLength(1);
    });

    it('should normalize math tokens before processing', () => {
      const html = '<p>Formula: [[iqb-math:x%5E2%2By%5E2%3Dz%5E2]]</p>';
      const settings = {} as unknown as CodeBookContentSetting;

      const result = (
        DownloadDocx as unknown as {
          htmlToDocx: (
            html: string,
            settings: CodeBookContentSetting
          ) => unknown[];
        }
      ).htmlToDocx(html, settings);

      expect(result).toHaveLength(1);
    });
  });

  describe('Utility methods', () => {
    it('should sanitize invalid XML chars inside OMML text nodes', () => {
      const downloadDocx = DownloadDocx as unknown as {
        sanitizeOmmlXml: (omml: string) => string;
      };
      const rawOmml = '<m:oMath><m:r><m:t xml:space="preserve">a<b & c</m:t></m:r></m:oMath>';
      const sanitizedOmml = downloadDocx.sanitizeOmmlXml(rawOmml);

      expect(sanitizedOmml).toContain('a&lt;b &amp; c');
      expect(sanitizedOmml).not.toContain('a<b & c');
    });

    it('should sanitize OMML before creating ImportedXmlComponent', () => {
      const fromXmlString = (
        jest.requireMock('docx') as {
          ImportedXmlComponent: { fromXmlString: jest.Mock };
        }
      ).ImportedXmlComponent.fromXmlString;
      fromXmlString.mockClear();

      const mml2ommlMock = (
        jest.requireMock('mathml2omml') as { mml2omml: jest.Mock }
      ).mml2omml;
      mml2ommlMock.mockReturnValueOnce(
        '<m:oMath><m:r><m:t xml:space="preserve">a<b & c</m:t></m:r></m:oMath>'
      );

      const downloadDocx = DownloadDocx as unknown as {
        latexToOmml: (latex: string) => unknown;
      };
      const result = downloadDocx.latexToOmml('a<b');

      expect(result).toEqual({});
      expect(fromXmlString).toHaveBeenCalledWith(
        '<m:oMath><m:r><m:t xml:space="preserve">a&lt;b &amp; c</m:t></m:r></m:oMath>'
      );
    });

    it('parseCssRgbString should parse rgb and rgba correctly', () => {
      const downloadDocx = DownloadDocx as unknown as {
        parseCssRgbString: (input: string) => number[];
      };
      expect(downloadDocx.parseCssRgbString('rgb(255, 0, 0)')).toEqual([
        255, 0, 0
      ]);
      expect(downloadDocx.parseCssRgbString('rgba(0, 255, 0, 0.5)')).toEqual([
        0, 255, 0
      ]);
    });

    it('toHex should convert rgb to hex', () => {
      const downloadDocx = DownloadDocx as unknown as {
        toHex: (red: number, green: number, blue: number) => string;
      };
      expect(downloadDocx.toHex(255, 0, 0)).toBe('ff0000');
      expect(downloadDocx.toHex(0, 255, 0)).toBe('00ff00');
    });

    it('getTransformation should resize large images', () => {
      const downloadDocx = DownloadDocx as unknown as {
        getTransformation: (
          actualSize: { width: number; height: number },
          max: number
        ) => { width: number; height: number };
      };
      const size = { width: 1000, height: 500 };
      const max = 400;
      const result = downloadDocx.getTransformation(size, max);
      expect(result.width).toBe(400);
      expect(result.height).toBe(200);
    });
  });
});
