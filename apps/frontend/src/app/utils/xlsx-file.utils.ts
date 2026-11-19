/** A column of a sheet: its header, the key of its value in a row, and how Excel shows a number or date. */
export interface XlsxColumn {
  header: string;
  key: string;
  width?: number;
  numFmt?: string;
}

export type XlsxRow = Record<string, string | number | Date | null | undefined>;

/**
 * An Excel file with one sheet: a bold header row, then one row per entry. The interface builds its
 * reports itself, so that headers and dates come in its own language (#2181). exceljs is loaded only
 * here, when a file is asked for: it is large, and most visits export nothing.
 */
export async function buildXlsxFile(sheetName: string, columns: XlsxColumn[], rows: XlsxRow[]): Promise<Blob> {
  // CommonJS: the bundle hands it over as `default`, Jest's require as the module itself
  const exceljs = await import('exceljs');
  const { Workbook } = exceljs.default ?? exceljs;
  const workbook = new Workbook();
  const sheet = workbook.addWorksheet(sheetName);
  sheet.columns = columns.map(column => ({
    header: column.header,
    key: column.key,
    width: column.width ?? 20,
    style: {
      alignment: { wrapText: true, vertical: 'top' },
      ...(column.numFmt ? { numFmt: column.numFmt } : {})
    }
  }));
  sheet.getRow(1).font = { bold: true };
  sheet.addRows(rows);
  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

/**
 * The Excel number format for a date in the date-fns format of a language (`dd.MM.yyyy`): Excel writes
 * the month in lower case, and a capital M would be read as minutes.
 */
export function xlsxDateFormat(dateFnsFormat: string): string {
  return dateFnsFormat.replace(/M/g, 'm');
}

/**
 * A point in time as the day it falls on for the reader, as a date cell. Excel dates have no time zone,
 * and exceljs writes them as UTC: the day is moved to midnight UTC so that it stays the same day.
 */
export function xlsxDay(isoTime: string): Date {
  const time = new Date(isoTime);
  return new Date(Date.UTC(time.getFullYear(), time.getMonth(), time.getDate()));
}
