import AdmZip from 'adm-zip';
import { create } from 'xmlbuilder2';
import { CodebookDocxGenerator } from '@iqb/ngx-coding-components/codebook-generator';
import {
  CodebookUnitDto,
  CodeBookContentSetting
} from '@iqb/ngx-coding-components/codebook-models';

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

const generateDocx = async (units: CodebookUnitDto[], settings: CodeBookContentSetting): Promise<Buffer> => {
  const blob = await CodebookDocxGenerator.generateDocx(units, settings);
  return Buffer.from(await blob.arrayBuffer());
};

const getDocumentXml = async (description: string): Promise<string> => new AdmZip(
  await generateDocx(buildUnits(description), defaultSettings)
).readAsText('word/document.xml');

describe('CodebookDocxGenerator integration', () => {
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  it.each([
    ['<p>10&nbsp;kg</p>', '10\u00a0kg'],
    ['<p>20&#8239;cm</p>', '20\u202fcm'],
    ['<p><strong>10&nbsp;kg</strong></p>', '10\u00a0kg'],
    ['<p>Abstand  bleibt</p>', 'Abstand  bleibt']
  ])('retains exact code and general instruction spacing for %p', async (html, text) => {
    const units = buildUnits(html);
    units[0].variables[0].generalInstruction = html;
    const settings = { ...defaultSettings, hasGeneralInstructions: true };
    const xml = new AdmZip(await generateDocx(units, settings)).readAsText('word/document.xml');
    expect(xml.split(`>${text}</w:t>`).length - 1).toBe(2);
  });

  it.each([' ', '\t\r\n', '\u00a0'])('does not add a paragraph for general instruction %p', async generalInstruction => {
    const units = buildUnits('<p>Bewerten</p>');
    const settings = { ...defaultSettings, hasGeneralInstructions: true };
    const baselineFile = await generateDocx(units, settings);
    const baseline = new AdmZip(baselineFile).readAsText('word/document.xml');
    units[0].variables[0].generalInstruction = generalInstruction;
    const actual = new AdmZip(await generateDocx(units, settings)).readAsText('word/document.xml');
    expect(actual).toBe(baseline);
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
