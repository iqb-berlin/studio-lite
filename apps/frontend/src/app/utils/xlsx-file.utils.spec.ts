import { Workbook } from 'exceljs';
import { buildXlsxFile, xlsxDateFormat, xlsxDay } from './xlsx-file.utils';

// jsdom's Blob has no arrayBuffer()
const bytesOf = (file: Blob) => new Promise<ArrayBuffer>(resolve => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result as ArrayBuffer);
  reader.readAsArrayBuffer(file);
});

// The sheet as a reader of the file sees it: name, bold header, cell values and their formats.
const readSheet = async (file: Blob) => {
  const workbook = new Workbook();
  await workbook.xlsx.load(await bytesOf(file));
  const [sheet] = workbook.worksheets;
  const rows: unknown[][] = [];
  sheet.eachRow(row => rows.push(Array.from({ length: sheet.columnCount }, (_, i) => row.getCell(i + 1).value)));
  return {
    name: sheet.name,
    bold: sheet.getRow(1).font?.bold,
    rows,
    formats: Array.from({ length: sheet.columnCount }, (_, i) => sheet.getRow(2).getCell(i + 1).numFmt)
  };
};

describe('xlsx file utils', () => {
  it('should write a sheet with a bold header and a row per entry, a date as a date cell', async () => {
    const file = await buildXlsxFile('Arbeitsbereiche', [
      { header: 'Name', key: 'name' },
      { header: 'Datum', key: 'day', numFmt: 'dd.mm.yyyy' },
      { header: 'Anzahl', key: 'count' }
    ], [
      { name: 'WS', day: new Date(Date.UTC(2026, 9, 30)), count: 3 },
      { name: 'Leer', day: null, count: undefined }
    ]);

    expect(file.type).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    expect(await readSheet(file)).toEqual({
      name: 'Arbeitsbereiche',
      bold: true,
      rows: [
        ['Name', 'Datum', 'Anzahl'],
        ['WS', new Date(Date.UTC(2026, 9, 30)), 3],
        ['Leer', null, null]
      ],
      formats: [undefined, 'dd.mm.yyyy', undefined]
    });
  });

  it.each([['dd.MM.yyyy', 'dd.mm.yyyy'], ['dd/MM/yyyy', 'dd/mm/yyyy']])(
    'should write the date format %s for Excel as %s',
    (dateFnsFormat, excelFormat) => {
      expect(xlsxDateFormat(dateFnsFormat)).toBe(excelFormat);
    }
  );

  // The tests run in German time. A change shortly after midnight there fell on the day before (#2082).
  it.each([
    ['winter', '2026-10-29T23:30:00.000Z', Date.UTC(2026, 9, 30)],
    ['summer', '2026-05-02T22:30:00.000Z', Date.UTC(2026, 4, 3)]
  ])('should give a change shortly after midnight in %s the day it falls on for the reader', (_, time, day) => {
    expect(xlsxDay(time)).toEqual(new Date(day));
  });
});
