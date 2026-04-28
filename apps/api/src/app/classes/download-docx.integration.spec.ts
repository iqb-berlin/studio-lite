import AdmZip = require('adm-zip');
import { create } from 'xmlbuilder2';
import {
  CodebookUnitDto,
  CodeBookContentSetting
} from '@studio-lite-lib/api-dto';
import { DownloadDocx } from './download-docx.class';

const defaultSettings = {
  showScore: false,
  hideItemVarRelation: false,
  hasGeneralInstructions: false,
  hasOnlyVarsWithCodes: false
} as unknown as CodeBookContentSetting;

const buildUnits = (description: string): CodebookUnitDto[] => [
  {
    key: 'U1',
    name: 'Unit 1',
    missings: [],
    items: [
      {
        id: 'ITEM1',
        variableId: 'V1'
      }
    ],
    variables: [
      {
        id: 'V1',
        label: 'Variable 1',
        generalInstruction: '',
        codes: [
          {
            id: '1',
            label: 'Label 1',
            score: '1',
            description
          }
        ]
      }
    ]
  }
] as unknown as CodebookUnitDto[];

const getDocumentXml = async (description: string): Promise<string> => {
  const buffer = await DownloadDocx.getDocXCodebook(
    buildUnits(description),
    defaultSettings
  );
  const zip = new AdmZip(buffer as Buffer);
  return zip.readAsText('word/document.xml');
};

describe('DownloadDocx integration', () => {
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  it('creates valid DOCX XML for Schemer formula spans with raw latex in data-latex', async () => {
    const description =
      '<p>Formel: ' +
      '<span class="iqb-math-formula" data-latex="a<b">' +
      '<span><math><semantics><mrow><mi>a</mi><mo>&lt;</mo><mi>b</mi></mrow></semantics></math></span>' +
      '</span>' +
      '</p>';

    const documentXml = await getDocumentXml(description);

    expect(() => create(documentXml)).not.toThrow();
    expect(documentXml).not.toContain('<undefined>');
    expect(documentXml).toContain('<m:oMath');
    expect(documentXml).toContain('a&lt;b');
    expect(documentXml).not.toContain('a<b</m:t>');
  });

  it('creates valid DOCX XML for iqb-math tokens with inequality latex', async () => {
    const description = '<p>Formel: [[iqb-math:a%3Cb]]</p>';

    const documentXml = await getDocumentXml(description);

    expect(() => create(documentXml)).not.toThrow();
    expect(documentXml).not.toContain('<undefined>');
    expect(documentXml).toContain('<m:oMath');
    expect(documentXml).toContain('a&lt;b');
    expect(documentXml).not.toContain('a<b</m:t>');
  });

  it('exports formula-only paragraphs as left-aligned math paragraphs for Word', async () => {
    const description = '<p><span class="iqb-math-formula" data-latex="e^2=m"></span></p>';

    const documentXml = await getDocumentXml(description);

    expect(() => create(documentXml)).not.toThrow();
    expect(documentXml).toContain('<m:oMathPara>');
    expect(documentXml).toContain('<m:oMathParaPr><m:jc m:val="left"/></m:oMathParaPr>');
    expect(documentXml).toContain('<m:oMath');
  });

  it('keeps inline formulas inline when a paragraph also contains text', async () => {
    const description =
      '<p>Prefix <span class="iqb-math-formula" data-latex="e^2=m"></span> suffix</p>';

    const documentXml = await getDocumentXml(description);

    expect(() => create(documentXml)).not.toThrow();
    expect(documentXml).not.toContain('<m:oMathPara>');
    expect(documentXml).toContain('<m:oMath');
    expect(documentXml).toContain('Prefix');
    expect(documentXml).toContain('suffix');
  });

  it('keeps the DOCX valid when unsupported formulas fall back to plain text', async () => {
    const description =
      '<p>Formel: ' +
      '<span class="iqb-math-formula" data-latex="\\text{AT&T}">' +
      '<span><math></math></span>' +
      '</span>' +
      '</p>';

    const documentXml = await getDocumentXml(description);

    expect(() => create(documentXml)).not.toThrow();
    expect(documentXml).not.toContain('<undefined>');
    expect(documentXml).toContain('AT&amp;T');
  });
});
