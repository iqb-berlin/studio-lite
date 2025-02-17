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

import {
  CodeBookContentSetting,
  CodebookUnitDto,
  CodeBookVariable,
  ItemsMetadataValues
} from '@studio-lite-lib/api-dto';
import * as cheerio from 'cheerio';
import { FileChild } from 'docx/build/file/file-child';
import { AnyNode, BasicAcceptedElems, Element } from 'cheerio';
// eslint-disable-next-line import/no-extraneous-dependencies
import { imageSize } from 'image-size';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ISizeCalculationResult } from 'image-size/dist/types/interface';
import { WebColors } from '../utils/webcolors';

type AnyNodeWithName = AnyNode & { name: string; };

export class DownloadDocx {
  static async getDocXCodebook(codingBookUnits: CodebookUnitDto[],
                               contentSetting: CodeBookContentSetting): Promise<Buffer | []> {
    if (codingBookUnits.length) {
      const units: FileChild[] = [];
      let missings: Paragraph[] = [];
      codingBookUnits.forEach(variableCoding => {
        missings = DownloadDocx.getMissings(variableCoding);
        if (variableCoding.variables.length || !contentSetting.hasOnlyVarsWithCodes) {
          units.push(...(DownloadDocx
            .createDocXForUnit(
              variableCoding.items,
              variableCoding.variables,
              contentSetting,
              DownloadDocx.getUnitHeader(variableCoding)
            ) as FileChild[])
          );
        }
      });
      const b64string = await Packer.toBase64String(
        DownloadDocx.setDocXDocument(
          units,
          missings)
      );
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

  private static getMissings(variableCoding: CodebookUnitDto): Paragraph[] {
    const missings: Paragraph[] = [];
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
    return missings;
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
        DownloadDocx.createCodeCell(
          DownloadDocx.createCellChildren(code.id),
          DownloadDocx.getColumnWidths(contentSetting)[0]),
        DownloadDocx.createCodeCell(
          DownloadDocx.createCellChildren(code.label),
          DownloadDocx.getColumnWidths(contentSetting)[1]),
        ...contentSetting.showScore ? [DownloadDocx
          .createCodeCell(
            DownloadDocx.createCellChildren(code.score),
            DownloadDocx.getColumnWidths(contentSetting)[2])] : [],
        DownloadDocx.createCodeCell(
          [...DownloadDocx.htmlToDocx(code.description, contentSetting)],
          DownloadDocx.getColumnWidths(contentSetting)[DownloadDocx.getColumnWidths(contentSetting).length - 1])
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
      indent: { start: 100, end: 100 }
    })];
  }

  private static createCodeCell(children: Paragraph[], width: number): TableCell {
    return new TableCell({
      borders: DownloadDocx.TableBoarders,
      children: children,
      // Need for Word, but not for Writer
      width: {
        size: width,
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

  private static getVariableItems(variable: CodeBookVariable, varItems:ItemsMetadataValues[]): Paragraph | [] {
    const filteredVarItems = varItems.filter(item => item.variableId === variable.id);
    let itemString = '';
    filteredVarItems.forEach(item => {
      itemString += `${item.id}   `;
    });
    if (filteredVarItems.length === 0) {
      return [];
    }

    return new Paragraph({
      text: `Item(s): ${itemString}`,
      heading: HeadingLevel.HEADING_3,
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
    return contentSetting.hasGeneralInstructions ? DownloadDocx
      .htmlToDocx(codeBookVariable.generalInstruction, contentSetting) : [];
  }

  private static getCodeTable(codeBookVariable: CodeBookVariable, contentSetting: CodeBookContentSetting): Table {
    return new Table({
      rows: DownloadDocx.getCodeRows(codeBookVariable, contentSetting),
      width: {
        size: 100,
        type: WidthType.PERCENTAGE
      },
      columnWidths: DownloadDocx.getColumnWidths(contentSetting) // Need for Writer, but not for Word
    });
  }

  private static getColumnWidths(contentSetting: CodeBookContentSetting): number[] {
    return contentSetting.showScore ? [8, 24, 8, 60] : [8, 24, 68];
  }

  private static getVariables(codeBookVariable: CodeBookVariable[],
                              contentSetting: CodeBookContentSetting,
                              varItems:ItemsMetadataValues[]): unknown[] {
    const variables: unknown[] = [];
    codeBookVariable.forEach(variable => {
      variables.push(...[
        DownloadDocx.getVariableHeader(variable),
        contentSetting.hideItemVarRelation ? [] : DownloadDocx.getVariableItems(variable, varItems),
        ...DownloadDocx.getGeneralInstructions(contentSetting, variable),
        DownloadDocx.getCodeTable(variable, contentSetting)]);
    });
    return variables;
  }

  private static createDocXForUnit(
    varItems: ItemsMetadataValues[],
    codeBookVariable: CodeBookVariable[],
    contentSetting: CodeBookContentSetting,
    unitHeader: Paragraph): unknown[] {
    return [
      unitHeader,
      ...DownloadDocx.getVariables(codeBookVariable, contentSetting, varItems),
      new Paragraph({
        text: '',
        spacing: {
          before: 100,
          after: 100
        }
      })
    ];
  }

  private static getChildren(cheerioAPI: cheerio.CheerioAPI, elem: BasicAcceptedElems<AnyNode>) {
    const children: AnyNodeWithName[] = [];
    cheerioAPI(elem).each((i, child: AnyNodeWithName) => {
      children.push(child);
      DownloadDocx.getChildren(cheerioAPI, cheerioAPI(child).contents());
    });
    return children;
  }

  private static getImageSize(imageBuffer: Buffer): ISizeCalculationResult {
    return imageSize(imageBuffer);
  }

  private static getTransformation(actualSize: ISizeCalculationResult, max: number): ISizeCalculationResult {
    const transformedSize: ISizeCalculationResult = { width: actualSize.width, height: actualSize.height };
    const maxWidth = max;
    const maxHeight = max;
    if (actualSize.width > maxWidth || actualSize.height > maxHeight) {
      const ratio = Math.min(maxWidth / actualSize.width, maxHeight / actualSize.height);
      transformedSize.width = actualSize.width * ratio;
      transformedSize.height = actualSize.height * ratio;
    }
    return transformedSize;
  }

  private static createImagePragraph(
    elem: Element,
    contentSetting: CodeBookContentSetting
  ): Paragraph {
    const imageBuffer = Buffer
      .from(elem.attribs.src.substring(elem.attribs.src.indexOf(',') + 1), 'base64');
    const size = DownloadDocx.getImageSize(imageBuffer);
    return new Paragraph(
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
          data: imageBuffer,
          transformation: DownloadDocx
            .getTransformation(size, contentSetting.showScore ? 334 : 382)
        })]
      }
    );
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
        const rgbString = DownloadDocx.parseCssRgbString(color);
        colorParsed = DownloadDocx.toHex(rgbString[0], rgbString[1], rgbString[2]);
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

  private static stripFromLeadingEmptyParagraph(html: string): string {
    return html.replace(/^<p><\/p>/, '');
  }

  private static convertLineBreaksToHTMLBreaks(html: string): string {
    return html.replace(/\n/g, '<br>');
  }

  private static prepareHtml(html: string): string {
    return DownloadDocx.convertLineBreaksToHTMLBreaks(
      DownloadDocx.stripFromLeadingEmptyParagraph(html)
    );
  }

  private static isListParagraph(elem: cheerio.Element): boolean {
    return elem.parent && (elem.parent as Element).name === 'li';
  }

  private static htmlToDocx(html: string, contentSetting: CodeBookContentSetting) {
    const cheerioAPI = cheerio
      .load(DownloadDocx.prepareHtml(html),
        null,
        false);
    const elements: Paragraph[] = [];
    cheerioAPI('p,h1,h2,h3,h4,img')
      .each((i, elem) => {
        try {
          const span = cheerioAPI(elem).find('span');
          if (elem.name === 'img') {
            elements.push(DownloadDocx.createImagePragraph(elem, contentSetting));
          } else {
            elements.push(DownloadDocx
              .createParagraph(
                cheerioAPI,
                elem.children,
                DownloadDocx.getTextAlignment(cheerioAPI, elem),
                DownloadDocx.getColor(cheerioAPI, span),
                DownloadDocx.getBackgroundColor(cheerioAPI, elem),
                DownloadDocx.getSize(cheerioAPI, span),
                DownloadDocx.isListParagraph(elem)));
          }
        } catch (e) {
          elements.push(new Paragraph(
            {
              text: 'HTML konnte nicht verarbeitet werden.'
            }
          ));
        }
      });
    return elements.filter(e => e !== undefined && e !== null);
  }

  private static getFontSize(size: string): number {
    const sizeTypes = ['xx-small', 'x-small', 'small', 'medium', 'large', 'x-large', 'xx-large'];
    return sizeTypes.includes(size) ? 20 : parseInt(size, 10);
  }

  private static getTextRun(
    cheerioAPI: cheerio.CheerioAPI,
    child: AnyNodeWithName,
    colorParsed: string,
    backgroundColor: string,
    size: string
  ): TextRun {
    const tag = child.name;
    return new TextRun({
      text: cheerioAPI(child)
        .text(),
      color: colorParsed,
      shading: {
        fill: backgroundColor
      },
      break: tag === 'br' ? 1 : null,
      underline: tag === 'u' ? {} : null,
      bold: tag === 'strong',
      italics: tag === 'em',
      strike: tag === 's',
      subScript: tag === 'sub',
      superScript: tag === 'sup',
      size: DownloadDocx.getFontSize(size)
    });
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
                                 size: string,
                                 isListParagraph: boolean
  ): Paragraph {
    return new Paragraph({
      alignment: DownloadDocx.getAlignment(textAlignment),
      spacing: {
        before: 100,
        after: 100
      },
      indent: !isListParagraph ? { start: 100, end: 100 } : null,
      bullet: isListParagraph ? { level: 0 } : null,
      children: DownloadDocx.getChildren(cheerioAPI, elem)
        .map((child: AnyNodeWithName) => DownloadDocx
          .getTextRun(cheerioAPI, child, colorParsed, backgroundColor, size))
    });
  }

  private static parseCssRgbString(input) {
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

  // Convert RGB color to HEX https://github.com/sindresorhus/rgb-hex
  // eslint-disable-next-line no-bitwise,no-mixed-operators
  private static toHex = (red, green, blue) => ((blue | green << 8 | red << 16) | 1 << 24).toString(16).slice(1);
}
