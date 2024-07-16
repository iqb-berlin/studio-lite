import {
  AlignmentType,
  Document,
  HeadingLevel,
  ImageRun,
  NumberFormat,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  Footer,
  WidthType,
  PageNumber,
  ITableCellBorders
} from 'docx';

import { CodeBookContentSetting, CodebookUnitDto, CodeBookVariable } from '@studio-lite-lib/api-dto';
import * as cheerio from 'cheerio';
import { UnderlineType } from 'docx/build/file/paragraph/run/underline';
import { ShadingType } from 'docx/build/file/shading/shading';
import { FileChild } from 'docx/build/file/file-child';
import { AnyNode, BasicAcceptedElems } from 'cheerio';
import { WebColors } from './webcolors';

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

type AnyNodeWithName = AnyNode & { name: string; };

export class DownloadDocx {
  static async getDocXCodebook(codingBookUnits: CodebookUnitDto[],
                               contentSetting: CodeBookContentSetting): Promise<Buffer | []> {
    if (codingBookUnits.length) {
      const units: FileChild[] = [];
      const missings: Paragraph[] = [];
      codingBookUnits.forEach(variableCoding => {
        const unitHeader = DownloadDocx.getUnitHeader(variableCoding);
        DownloadDocx.addMissings(variableCoding, missings);
        if (variableCoding.variables.length) {
          DownloadDocx.addDocXForUnit(variableCoding.variables, contentSetting, unitHeader, units);
        }
      });
      const b64string = await Packer.toBase64String(DownloadDocx.setDocXDocument(units, missings));
      return Buffer.from(b64string, 'base64');
    }
    return [];
  }

  private static getUnitHeader(variableCoding: CodebookUnitDto): Paragraph {
    return new Paragraph({
      border: {
        bottom: {
          color: '#000000',
          style: 'single',
          size: 10
        },
        top: {
          color: '#000000',
          style: 'single',
          size: 10
        }

      },
      spacing: {
        after: 200
      },
      text: `${variableCoding.key}  ${variableCoding.name}`,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER
    });
  }

  private static addMissings(variableCoding: CodebookUnitDto, missings: Paragraph[]): void {
    try {
      variableCoding.missings.forEach(missing => {
        if (missing.code && missing.label && missing.description) {
          missings.push(new Paragraph({
            children: [new TextRun({ text: `${missing.code} ${missing.label}`, bold: true })],
            spacing: {
              after: 20
            }
          }));
          missings.push(new Paragraph({
            text: `${missing.description}`,
            spacing: {
              after: 100
            }
          }));
        } else {
          missings.push(new Paragraph({
            text: 'kein valides Missing ',
            spacing: {
              after: 200
            }
          }));
        }
      });
    } catch {
      missings.push(new Paragraph({
        text: 'kein validen Missings gefunden',
        spacing: {
          after: 200
        }
      }));
    }
  }

  private static get TableBoarders(): ITableCellBorders {
    return {
      top: {
        size: 1,
        color: '#000000',
        style: 'single'
      },
      bottom: {
        size: 1,
        color: '#000000',
        style: 'single'
      },
      left: {
        size: 1,
        color: '#000000',
        style: 'single'
      },
      right: {
        size: 1,
        color: '#000000',
        style: 'single'
      }
    };
  }

  private static getCodeRows(variable: CodeBookVariable, contentSetting: CodeBookContentSetting): TableRow[] {
    return variable.codes.map(code => new TableRow({
      cantSplit: true,
      children: [
        DownloadDocx.createCodeCell(DownloadDocx.createCellChildren(code.id)),
        DownloadDocx.createCodeCell(DownloadDocx.createCellChildren(code.label)),
        ...contentSetting.showScore ? [DownloadDocx
          .createCodeCell(DownloadDocx.createCellChildren(code.score))] : [],
        DownloadDocx.createCodeCell([...DownloadDocx.htmlToDocx(code.description)])
      ]
    })
    );
  }

  private static createCellChildren(value: string): Paragraph[] {
    return [new Paragraph({
      text: value,
      spacing: {
        before: 100,
        after: 100
      },
      indent: { firstLine: 50 }
    })];
  }

  private static createCodeCell(children: Paragraph[]): TableCell {
    return new TableCell({
      borders: DownloadDocx.TableBoarders,
      children: children,
      width: {
        size: 100,
        type: WidthType.PERCENTAGE
      }
    });
  }

  private static setDocXDocument(units: FileChild[], missings: Paragraph[]): Document {
    return new Document({
      background: {
        color: '#FFFFFF'
      },
      sections: [
        {
          properties: {
            page: {
              pageNumbers: {
                start: 1,
                formatType: NumberFormat.DECIMAL
              }
            }
          },
          footers: {
            default: new Footer({
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun('IQB-Studio Codebook '),
                    new TextRun(new Date().toLocaleDateString())
                  ]
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      color: '000000',
                      children: [' Seite ', PageNumber.CURRENT]
                    }),
                    new TextRun({
                      color: '000000',
                      children: [' von ', PageNumber.TOTAL_PAGES]
                    })
                  ]
                })
              ]
            })
          },
          children: [
            ...missings,
            ...units
          ]
        }]
    });
  }

  private static getVariableHeader(variable: CodeBookVariable): Paragraph {
    return new Paragraph({
      text: `${variable.id}  ${variable.label}`,
      heading: HeadingLevel.HEADING_2,
      alignment: AlignmentType.LEFT,
      spacing: {
        before: 200,
        after: 200
      }
    });
  }

  private static getGeneralInstructions(
    contentSetting: CodeBookContentSetting,
    codeBookVariable: CodeBookVariable
  ): Paragraph[] {
    return contentSetting.hasGeneralInstructions ? DownloadDocx.htmlToDocx(codeBookVariable.generalInstruction) : [];
  }

  private static getCodeTable(codeBookVariable: CodeBookVariable, contentSetting: CodeBookContentSetting): Table {
    return new Table({
      rows: DownloadDocx.getCodeRows(codeBookVariable, contentSetting),
      width: {
        size: 100,
        type: WidthType.PERCENTAGE
      },
      columnWidths: DownloadDocx.getColumnWidths(contentSetting)
    });
  }

  private static getColumnWidths(contentSetting: CodeBookContentSetting): number[] {
    return contentSetting.showScore ? [10, 25, 10, 55] : [10, 25, 65];
  }

  private static getVariables(codeBookVariable: CodeBookVariable[], contentSetting: CodeBookContentSetting): unknown[] {
    const variables: unknown[] = [];
    codeBookVariable.forEach(variable => {
      variables.push(...[
        DownloadDocx.getVariableHeader(variable),
        ...DownloadDocx.getGeneralInstructions(contentSetting, variable),
        DownloadDocx.getCodeTable(variable, contentSetting)]);
    });
    return variables;
  }

  private static addDocXForUnit(
    codeBookVariable: CodeBookVariable[],
    contentSetting: CodeBookContentSetting,
    unitHeader: Paragraph,
    units: unknown[]): void {
    units.push(
      ...[
        unitHeader,
        ...DownloadDocx.getVariables(codeBookVariable, contentSetting),
        new Paragraph({
          text: '',
          spacing: {
            before: 100,
            after: 100
          }
        })
      ]);
  }

  private static getChildren(cheerioAPI: cheerio.CheerioAPI, elem: BasicAcceptedElems<AnyNode>) {
    const children: AnyNodeWithName[] = [];
    cheerioAPI(elem).each((i, child: AnyNodeWithName) => {
      children.push(child);
      DownloadDocx.getChildren(cheerioAPI, cheerioAPI(child).contents());
    });
    return children;
  }

  private static addImages(cheerioAPI: cheerio.CheerioAPI, elements: Paragraph[]): void {
    cheerioAPI('img')
      .each((i, elem) => {
        elements.push(new Paragraph(
          {
            spacing: {
              before: 100,
              after: 100
            },
            indent: {
              start: 100,
              end: 100
            },
            children: [new ImageRun({
              data: Buffer.from(
                elem.attribs.src.substring(elem.attribs.src.indexOf(',') + 1),
                'base64'),
              transformation: {
                width: 200,
                height: 200
              }
            })]
          }
        ));
      });
  }

  private static getBackgroundColor(cheerioAPI: cheerio.CheerioAPI, elem: cheerio.Element): string {
    const mark = cheerioAPI(elem)
      .find('mark');
    return cheerioAPI(mark)
      .css('background-color') || '#FFFFFF';
  }

  private static getColor(cheerioAPI: cheerio.CheerioAPI, tag: cheerio.Cheerio<cheerio.Element>): string {
    const color = cheerioAPI(tag)
      .css('color');
    // const name = elem.name;
    let colorParsed: string = '#000000';
    if (color) {
      if (color.startsWith('#')) {
        colorParsed = color;
      } else if (color.startsWith('rgb')) {
        const rgbString = parseCssRgbString(color);
        colorParsed = toHex(rgbString[0], rgbString[1], rgbString[2]);
      } else if (WebColors.getHexFromWebColor(color.toLowerCase())) {
        colorParsed = `#${WebColors.getHexFromWebColor(color.toLowerCase())}`;
      }
    }
    return colorParsed;
  }

  private static getSize(cheerioAPI: cheerio.CheerioAPI, tag: cheerio.Cheerio<cheerio.Element>): string {
    return cheerioAPI(tag)
      .css('font-size') || '20pt';
  }

  private static getTextAlignment(cheerioAPI: cheerio.CheerioAPI, elem: cheerio.Element): string {
    return cheerioAPI(elem)
      .css('text-align') || 'left';
  }

  private static htmlToDocx(html: string) {
    const cheerioAPI = cheerio.load(html, null, false);
    const elements: Paragraph[] = [];

    cheerioAPI('p,h1,h2,h3,h4')
      .each((i, elem) => {
        const span = cheerioAPI(elem)
          .find('span');
        let formattedParagraph:Paragraph;
        try {
          formattedParagraph = DownloadDocx
            .createParagraph(
              cheerioAPI,
              elem.children,
              DownloadDocx.getTextAlignment(cheerioAPI, elem),
              DownloadDocx.getColor(cheerioAPI, span),
              DownloadDocx.getBackgroundColor(cheerioAPI, elem),
              DownloadDocx.getSize(cheerioAPI, span));
        } catch (e) {
          formattedParagraph = new Paragraph(
            {
              text: 'HTML konnte nicht verarbeitet werden.'
            }
          );
        }
        if (formattedParagraph) {
          elements.push(formattedParagraph);
        }
      });

    DownloadDocx.addImages(cheerioAPI, elements);
    return elements.filter(e => e !== undefined && e !== null);
  }

  private static getTextRunOptions(
    cheerioAPI: cheerio.CheerioAPI,
    child: AnyNodeWithName,
    colorParsed: string,
    backgroundColor: string,
    size: string
  ): ParagraphOptions {
    const tag = child.name;
    const textRunOptions: ParagraphOptions = {
      text: cheerioAPI(child)
        .text()
    };
    textRunOptions.color = colorParsed;
    textRunOptions.shading = {
      fill: backgroundColor
    };
    if (size) {
      const sizeTypes = ['xx-small', 'x-small', 'small', 'medium', 'large', 'x-large', 'xx-large'];
      sizeTypes.includes(size) ? textRunOptions.size = 20 : textRunOptions.size = parseInt(size, 10);
    }
    if (tag === 'u') {
      textRunOptions.underline = {};
    }
    textRunOptions.bold = tag === 'strong';
    textRunOptions.italics = tag === 'em';
    textRunOptions.strike = tag === 's';
    textRunOptions.subscript = tag === 'sub';
    textRunOptions.superscript = tag === 'sup';
    return textRunOptions;
  }

  private static getAlignment(textAlignment: string): (typeof AlignmentType)[keyof typeof AlignmentType] {
    switch (textAlignment) {
      case 'center':
        return AlignmentType.CENTER;
      case 'right':
        return AlignmentType.RIGHT;
      case 'justify':
        return AlignmentType.JUSTIFIED;
      default:
        return AlignmentType.LEFT;
    }
  }

  private static createParagraph(cheerioAPI: cheerio.CheerioAPI,
                                 elem: BasicAcceptedElems<AnyNode>,
                                 textAlignment: string,
                                 colorParsed: string,
                                 backgroundColor: string,
                                 size: string) {
    return new Paragraph({
      alignment: DownloadDocx.getAlignment(textAlignment),
      spacing: {
        before: 100,
        after: 100
      },
      indent: {
        start: 100,
        end: 100
      },
      children: DownloadDocx.getChildren(cheerioAPI, elem)
        .map((child: AnyNodeWithName) => new TextRun(DownloadDocx
          .getTextRunOptions(cheerioAPI, child, colorParsed, backgroundColor, size)))
    });
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
