import {
  AlignmentType, Document, HeadingLevel, ImageRun, Packer, Paragraph, Table, TableCell,
  TableRow, WidthType
} from 'docx';

import { parse } from 'node-html-parser';
import { CodebookUnit } from '@studio-lite-lib/api-dto';
import { stripHtml } from 'string-strip-html';

export class DownloadDocx {
  static async getCodebook(codingBook:CodebookUnit[]): Promise<Buffer> {
    let codeRows: TableRow[] = [];
    let codesTable!: Table;
    let variableGeneralInstruction:Paragraph;
    let variableHeader:Paragraph;
    let unitHeader:Paragraph;
    const paragraphs: Paragraph[] = [];
    const images: ImageRun[] = [];
    const bookVariables = [];
    if (codingBook.length > 0) {
      codingBook.forEach(variableCoding => {
        unitHeader = new Paragraph({
          text: `${variableCoding.key}  ${variableCoding.name}`,
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.LEFT
        });
        if (variableCoding.variables.length > 0) {
          variableCoding.variables?.forEach(variable => {
            variableHeader = new Paragraph({
              text: `${variable.id}  ${variable.label}`,
              heading: HeadingLevel.HEADING_2,
              alignment: AlignmentType.LEFT
            });
            const root = parse(variable.generalInstruction);
            if (root.childNodes.length > 0) {
              root.querySelectorAll('p,h1,h2,h3,h4').forEach(p => {
                if (p.childNodes.length > 0) {
                  p.childNodes.forEach(child => {
                  });
                }
                paragraphs.push(
                  new Paragraph({
                    text: p.innerText,
                    spacing: {
                      before: 100,
                      after: 100
                    },
                    indent: { firstLine: 100 }
                  }));
              });
              root.querySelectorAll('img').forEach(img => {
                const base64 = img.getAttribute('src').substring(img.getAttribute('src').indexOf(',') + 1);
                images.push(new ImageRun({
                  data: Buffer.from(base64, 'base64'),
                  transformation: {
                    width: 200,
                    height: 200
                  }
                }));
              });
            }

            variableGeneralInstruction = new Paragraph({
              text: `${variable.generalInstruction}`,
              heading: HeadingLevel.HEADING_2,
              alignment: AlignmentType.LEFT
            });

            function getHtml(html:string) {
              const parsedHTML = parse(html);
              const paras: Paragraph[] = [];
              const imgs : ImageRun[] = [];
              if (root.childNodes.length > 0) {
                root.querySelectorAll('p,h1,h2,h3,h4').forEach(p => {
                  if (p.childNodes.length > 0) {
                    p.childNodes.forEach(child => {
                    });
                  }
                  paras.push(
                    new Paragraph({
                      text: p.innerText,
                      spacing: {
                        before: 100,
                        after: 100
                      },
                      indent: { firstLine: 100 }
                    }));
                });
                root.querySelectorAll('img').forEach(img => {
                  const base64 = img.getAttribute('src').substring(img.getAttribute('src').indexOf(',') + 1);
                  imgs.push(new ImageRun({
                    data: Buffer.from(base64, 'base64'),
                    transformation: {
                      width: 200,
                      height: 200
                    }
                  }));
                });
              }
              return [paras, imgs];
            }

            codeRows = variable.codes.map(code => new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({
                    text: `${code.id}  ${code.label}`,
                    spacing: {
                      before: 100,
                      after: 100
                    },
                    indent: { firstLine: 100 }
                  })],
                  width: {
                    size: 50,
                    type: WidthType.PERCENTAGE
                  }
                }),
                new TableCell({
                  children: [new Paragraph({
                    text: `${code.score}  ${code.scoreLabel}`,
                    spacing: {
                      before: 100,
                      after: 100
                    },
                    indent: { firstLine: 100 }
                  })],
                  width: {
                    size: 50,
                    type: WidthType.PERCENTAGE
                  }
                }),
                new TableCell({
                  children: [new Paragraph({
                    text: `${code.description}`,
                    spacing: {
                      before: 100,
                      after: 100
                    },
                    indent: { firstLine: 100 }
                  })],
                  width: {
                    size: 50,
                    type: WidthType.PERCENTAGE
                  }
                })
              ]
            }));
          });
          codesTable = new Table({
            rows: codeRows,
            width: {
              size: 100,
              type: WidthType.PERCENTAGE
            }
          });
          bookVariables.push(variableHeader, variableGeneralInstruction, codesTable);
        }
      });
      const doc = new Document({
        sections: [{
          children: [
            new Paragraph({
              children: [images[0]]
            }),
            paragraphs[0],
            paragraphs[1],
            unitHeader,
            variableHeader,
            variableGeneralInstruction,
            codesTable,
            new Paragraph({
              text: '',
              spacing: {
                before: 100,
                after: 100
              }
            }),
            // new XmlComponent({}),
            new Paragraph({
              text: '',
              spacing: {
                before: 100,
                after: 100
              }
            })
          ]
        }]
      });
      const b64string = await Packer.toBase64String(doc);
      return Buffer.from(b64string, 'base64');
    }
  }
}
