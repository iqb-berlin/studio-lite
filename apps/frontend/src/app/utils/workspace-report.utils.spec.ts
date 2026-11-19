import { WorkspaceReportDto } from '@studio-lite-lib/api-dto';
import { workspaceReportSheet } from './workspace-report.utils';

describe('workspaceReportSheet', () => {
  const translate = (key: string) => `[${key}]`;
  const workspace = (id: number, changes: Partial<WorkspaceReportDto> = {}): WorkspaceReportDto => ({
    groupId: 1,
    groupName: 'G1',
    workspaceId: id,
    workspaceName: `WS${id}`,
    lastChange: null,
    unitCount: 0,
    editors: {},
    players: {},
    schemers: {},
    ...changes
  });

  // A column per module in use, in the order of first appearance; a unit without one is counted
  // under "no editor", and a module a workspace does not use leaves its cell empty.
  it('should give every module in use a column and every workspace a row', () => {
    const { columns, rows } = workspaceReportSheet([
      workspace(10, {
        unitCount: 3, editors: { E: 2, '': 1 }, players: { P: 3 }, schemers: { S: 3 }
      }),
      workspace(11, {
        unitCount: 1, editors: { F: 1 }, players: { P: 1 }, schemers: { '': 1 }
      })
    ], translate, 'dd.MM.yyyy');

    expect(columns.map(column => column.header)).toEqual([
      '[workspace-report.group-name]', '[workspace-report.group-id]', '[workspace-report.workspace-name]',
      '[workspace-report.workspace-id]', '[workspace-report.last-change]', '[workspace-report.unit-count]',
      'E', '[workspace-report.no-editor]', 'F', 'P', 'S', '[workspace-report.no-schemer]'
    ]);
    expect(rows.map(row => columns.map(column => row[column.key]))).toEqual([
      ['G1', 1, 'WS10', 10, null, 3, 2, 1, undefined, 3, 3, undefined],
      ['G1', 1, 'WS11', 11, null, 1, undefined, undefined, 1, 1, undefined, 1]
    ]);
  });

  // The day as the reader's, in the date format of the language (#2082, #2181)
  it('should write the latest change as a date in the format of the language', () => {
    const { columns, rows } = workspaceReportSheet(
      [workspace(10, { lastChange: '2026-10-29T23:30:00.000Z' })],
      translate,
      'dd/MM/yyyy'
    );

    expect(columns.find(column => column.key === 'lastChange')?.numFmt).toBe('dd/mm/yyyy');
    const [{ lastChange }] = rows;
    expect(lastChange).toEqual(new Date(Date.UTC(2026, 9, 30)));
  });
});
