import { WorkspaceReportDto } from '@studio-lite-lib/api-dto';
import {
  buildXlsxFile, XlsxColumn, xlsxDateFormat, xlsxDay, XlsxRow
} from './xlsx-file.utils';

type ModuleKind = 'editors' | 'players' | 'schemers';

const MODULE_KINDS: { kind: ModuleKind; none: string }[] = [
  { kind: 'editors', none: 'workspace-report.no-editor' },
  { kind: 'players', none: 'workspace-report.no-player' },
  { kind: 'schemers', none: 'workspace-report.no-schemer' }
];

/**
 * The report over workspaces as a sheet: a row per workspace, and after the fixed columns one column
 * per module in use, in the order they first appear. A unit without a module is counted under
 * "no editor" (player, schemer); a module a workspace does not use leaves its cell empty.
 */
export function workspaceReportSheet(
  report: WorkspaceReportDto[],
  translate: (key: string) => string,
  dateFormat: string
): { columns: XlsxColumn[]; rows: XlsxRow[] } {
  const moduleColumns = MODULE_KINDS.flatMap(({ kind, none }) => [
    ...new Set(report.flatMap(workspace => Object.keys(workspace[kind])))
  ].map(module => ({ kind, module, header: module || translate(none) })));
  const columns: XlsxColumn[] = [
    { header: translate('workspace-report.group-name'), key: 'groupName' },
    { header: translate('workspace-report.group-id'), key: 'groupId' },
    { header: translate('workspace-report.workspace-name'), key: 'workspaceName' },
    { header: translate('workspace-report.workspace-id'), key: 'workspaceId' },
    { header: translate('workspace-report.last-change'), key: 'lastChange', numFmt: xlsxDateFormat(dateFormat) },
    { header: translate('workspace-report.unit-count'), key: 'unitCount' },
    ...moduleColumns.map(({ kind, module, header }) => ({ header, key: `${kind}:${module}` }))
  ];
  const rows = report.map(workspace => ({
    groupName: workspace.groupName,
    groupId: workspace.groupId,
    workspaceName: workspace.workspaceName,
    workspaceId: workspace.workspaceId,
    lastChange: workspace.lastChange ? xlsxDay(workspace.lastChange) : null,
    unitCount: workspace.unitCount,
    ...Object.fromEntries(moduleColumns.map(({ kind, module }) => [`${kind}:${module}`, workspace[kind][module]]))
  }));
  return { columns, rows };
}

/** The report over workspaces as an Excel file, in the language `translate` speaks (#2181). */
export function buildWorkspaceReportFile(
  report: WorkspaceReportDto[],
  translate: (key: string) => string,
  dateFormat: string
): Promise<Blob> {
  const { columns, rows } = workspaceReportSheet(report, translate, dateFormat);
  return buildXlsxFile(translate('workspace-report.sheet'), columns, rows);
}
