import {
  AlignmentType,
  Document,
  HeadingLevel,
  ImageRun,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType
} from 'docx';

import { CodeBookContentSetting, CodebookDto } from '@studio-lite-lib/api-dto';
import * as cheerio from 'cheerio';
import { UnderlineType } from 'docx/build/file/paragraph/run/underline';
import { ShadingType } from 'docx/build/file/shading/shading';

type ParagraphOptions = {
  text?: string;
  underline?: {
    color?: string;
    type?: (typeof UnderlineType)[keyof typeof UnderlineType];
  };
  heading?: (typeof HeadingLevel)[keyof typeof HeadingLevel];
  bold?: boolean;
  italics?: boolean;
  strike?: boolean;
  subscript?: boolean;
  superscript?: boolean;
  color?: string;
  shading?:{
    type?: (typeof ShadingType)[keyof typeof ShadingType];
    color?: string;
    fill?: string;
  };
  size?:number;
};

export class DownloadDocx {
  static async getCodebook(codingBookUnits:CodebookDto[], contentSetting:CodeBookContentSetting): Promise<Buffer | []> {
    let codeRows: TableRow[] = [];
    let codesTable!: Table;
    let unitHeader:Paragraph;
    let generalInstructions:Paragraph[] = [];

    const units = [];
    if (codingBookUnits.length > 0) {
      codingBookUnits.forEach(variableCoding => {
        unitHeader = new Paragraph({
          border: {
            bottom: {
              color: 'FFFFFF',
              style: 'single',
              size: 10
            },
            top: {
              color: 'FFFFFF',
              style: 'single',
              size: 10
            }

          },
          spacing: {
            after: 200
          },
          text: `${variableCoding.key}  ${variableCoding.name}`,
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          shading: {
            fill: 'e7e7e7',
            type: 'solid'
          }
        });
        const variables = [];
        if (variableCoding.variables.length > 0) {
          variableCoding.variables?.forEach(variable => {
            const variableHeader = new Paragraph({
              text: `${variable.id}  ${variable.label}`,
              heading: HeadingLevel.HEADING_2,
              alignment: AlignmentType.LEFT,
              spacing: {
                before: 200,
                after: 200
              }
            });
            if (contentSetting.hasGeneralInstructions === 'true') {
              generalInstructions = this.htmltoDocx(variable.generalInstruction);
            } else generalInstructions = [];

            codeRows = variable.codes.map(code => new TableRow({
              cantSplit: true,
              children: [
                new TableCell({
                  borders: {
                    top: { size: 1, color: 'FFFFFF', style: 'single' },
                    bottom: { size: 1, color: 'FFFFFF', style: 'single' },
                    left: { size: 1, color: 'FFFFFF', style: 'single' },
                    right: { size: 1, color: 'FFFFFF', style: 'single' }
                  },
                  children: [new Paragraph({
                    text: `${code.id}  ${code.label}`,
                    spacing: {
                      before: 100,
                      after: 100
                    },
                    indent: { firstLine: 100 }
                  })],
                  width: {
                    size: '25%',
                    type: WidthType.PERCENTAGE
                  }
                }),
                new TableCell({

                  borders: {
                    top: { size: 1, color: 'FFFFFF', style: 'single' },
                    bottom: { size: 1, color: 'FFFFFF', style: 'single' },
                    left: { size: 1, color: 'FFFFFF', style: 'single' },
                    right: { size: 1, color: 'FFFFFF', style: 'single' }
                  },
                  children: [new Paragraph({
                    text: `${code.score}  ${code.scoreLabel}`,
                    spacing: {
                      before: 100,
                      after: 100
                    },
                    indent: { firstLine: 100 }
                  })],
                  width: {
                    size: '25%',
                    type: WidthType.PERCENTAGE
                  }
                }),
                new TableCell({
                  width: {
                    size: '50%',
                    type: WidthType.PERCENTAGE
                  },
                  borders: {
                    top: { size: 1, color: 'FFFFFF', style: 'single' },
                    bottom: { size: 1, color: 'FFFFFF', style: 'single' },
                    left: { size: 1, color: 'FFFFFF', style: 'single' },
                    right: { size: 1, color: 'FFFFFF', style: 'single' }
                  },
                  children: [...this.htmltoDocx(code.description)]
                })
              ]
            })
            );
            codesTable = new Table({
              rows: codeRows,
              width: {
                size: 100,
                type: WidthType.PERCENTAGE
              }
            });
            variables.push(...[variableHeader, ...generalInstructions, codesTable]);
          });

          units.push(
            ...[
              unitHeader,
              ...variables,
              new Paragraph({
                text: '',
                spacing: {
                  before: 100,
                  after: 100
                }
              })
            ]);
        }
      });
      const doc = new Document({
        background: {
          color: '000000'
        },
        sections: [{
          children: [
            ...units

          ]
        }]
      });
      const b64string = await Packer.toBase64String(doc);
      return Buffer.from(b64string, 'base64');
    }
    return [];
  }

  static htmltoDocx(html:string) {
    const $ = cheerio.load(html, null, false);
    const elements = [];
    const images = [];
    $('img').each((i, elem) => {
      const base64 = elem.attribs.src.substring(elem.attribs.src.indexOf(',') + 1);
      images.push(
        new ImageRun({
          data: Buffer.from(base64, 'base64'),
          transformation: {
            width: 200,
            height: 200
          }
        }));
    });
    $('p,h1,h2,h3,h4').each((i, elem) => {
      const textAlignment = $(elem).css('text-align');
      const span = $(elem).find('span');
      const mark = $(elem).find('mark');
      const color = $(span).css('color');
      // const name = elem.name;
      let colorParsed:string;
      if (color) {
        if (color.startsWith('#')) {
          colorParsed = color;
        } else {
          const rgbString = parseCssRgbString(color);
          colorParsed = toHex(rgbString[0], rgbString[1], rgbString[2]);
        }
      }
      const size = $(span).css('font-size')?.replace('px', '');
      const backgroundColor = $(mark).css('background-color');
      const formattedParagraph = createParagraph(elem.children, textAlignment, colorParsed, backgroundColor, size);
      if (formattedParagraph) {
        elements.push(formattedParagraph);
      }
    });
    images.forEach(image => elements.push(new Paragraph(
      {
        spacing: {
          before: 100,
          after: 100
        },
        indent: { start: 100, end: 100 },
        children: [image]
      }
    )));
    return elements.filter(e => e !== undefined && e !== null);

    function getChildrenTags(elem) {
      const ele = [];
      $(elem).each((i, el) => {
        ele.push(el.name);
        getChildrenTags($(el).contents());
      });
      return ele;
    }
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    function createParagraph(elem:any, textAlignment:string, colorParsed:string, backgroundColor:string, size:string) {
      const tags = getChildrenTags(elem);

      const textRunOptions: ParagraphOptions = { text: $(elem).text() };
      let alignment:(typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.LEFT;
      // let heading :(typeof HeadingLevel)[keyof typeof HeadingLevel];
      if (textAlignment) {
        if (textAlignment === 'center') alignment = AlignmentType.CENTER;
        if (textAlignment === 'right') alignment = AlignmentType.RIGHT;
        if (textAlignment === 'justify') alignment = AlignmentType.JUSTIFIED;
      }

      if (colorParsed) {
        textRunOptions.color = colorParsed;
      }
      if (backgroundColor) {
        textRunOptions.shading = {
          fill: backgroundColor
        };
      }
      if (size) {
        textRunOptions.size = Number(size);
      }

      if (tags.includes('u')) {
        textRunOptions.underline = {};
      }
      if (tags.includes('strong')) {
        textRunOptions.bold = true;
      }
      if (tags.includes('em')) {
        textRunOptions.italics = true;
      }
      if (tags.includes('s')) {
        textRunOptions.strike = true;
      }
      if (tags.includes('sub')) {
        textRunOptions.subscript = true;
      }
      if (tags.includes('sup')) {
        textRunOptions.superscript = true;
      }

      return new Paragraph({
        alignment: alignment,
        spacing: {
          before: 100,
          after: 100
        },
        indent: { start: 100, end: 100 },
        children: [new TextRun(textRunOptions)]
      });
    }
  }
}

// Convert RGB color to HEX https://github.com/sindresorhus/rgb-hex
function parseCssRgbString(input) {
  const parts = input?.replace(/rgba?\(([^)]+)\)/, '$1').split(/[,\s/]+/).filter(Boolean);
  if (parts?.length < 3) {
    return;
  }

  const parseValue = (value, max) => {
    // eslint-disable-next-line no-param-reassign
    value = value.trim();

    if (value.endsWith('%')) {
      // eslint-disable-next-line no-bitwise,no-mixed-operators
      return Math.min(Number.parseFloat(value) * max / 100, max);
    }

    return Math.min(Number.parseFloat(value), max);
  };

  const red = parseValue(parts[0], 255);
  const green = parseValue(parts[1], 255);
  const blue = parseValue(parts[2], 255);

  // eslint-disable-next-line consistent-return
  return [red, green, blue];
}

// eslint-disable-next-line no-bitwise,no-mixed-operators
const toHex = (red, green, blue) => ((blue | green << 8 | red << 16) | 1 << 24).toString(16).slice(1);