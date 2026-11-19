import { createMock } from '@golevelup/ts-jest';
import { UnitPropertiesDto, WorkspaceGroupDto } from '@studio-lite-lib/api-dto';
import type { UnitService } from '../services/unit.service';
import type { WorkspaceService } from '../services/workspace.service';
import { WorkspaceReportClass } from './workspace-report.class';

describe('WorkspaceReportClass', () => {
  const workspaceService = createMock<WorkspaceService>();
  const unitService = createMock<UnitService>();
  const unit = (editor: string | null, changes: Partial<UnitPropertiesDto> = {}) => ({
    editor,
    player: 'P',
    schemer: 'S',
    lastChangedMetadata: null,
    lastChangedDefinition: null,
    lastChangedScheme: null,
    ...changes
  }) as unknown as UnitPropertiesDto;

  beforeEach(() => {
    workspaceService.findAllGroupwise.mockResolvedValue([
      { id: 1, name: 'G1', workspaces: [{ id: 10, name: 'WS10' }, { id: 11, name: 'WS11' }] },
      { id: 2, name: 'G2', workspaces: [{ id: 20, name: 'WS20' }] }
    ] as unknown as WorkspaceGroupDto[]);
    unitService.findAllWithProperties.mockImplementation(async workspaceId => (
      workspaceId === 10 ? [unit('E'), unit('E'), unit(''), unit(null)] : []
    ));
  });

  // A unit without a module is counted under '', whether the module is empty or missing.
  it('should count the units of each workspace per module', async () => {
    expect(await WorkspaceReportClass.build(workspaceService, unitService, 1)).toEqual([
      {
        groupId: 1,
        groupName: 'G1',
        workspaceId: 10,
        workspaceName: 'WS10',
        lastChange: null,
        unitCount: 4,
        editors: { E: 2, '': 2 },
        players: { P: 4 },
        schemers: { S: 4 }
      },
      {
        groupId: 1,
        groupName: 'G1',
        workspaceId: 11,
        workspaceName: 'WS11',
        lastChange: null,
        unitCount: 0,
        editors: {},
        players: {},
        schemers: {}
      }
    ]);
  });

  it('should report every group when none is chosen', async () => {
    const rows = await WorkspaceReportClass.build(workspaceService, unitService, 0);

    expect(rows.map(row => row.workspaceId)).toEqual([10, 11, 20]);
  });

  // The units come sorted by key; the report showed the change of the last one (#1983).
  it('should give the newest change of any unit as the latest change of the workspace', async () => {
    unitService.findAllWithProperties.mockImplementation(async workspaceId => (workspaceId === 10 ? [
      unit('E', {
        key: 'A1',
        lastChangedMetadata: new Date(Date.UTC(2026, 9, 1, 12)),
        lastChangedScheme: new Date(Date.UTC(2026, 9, 30, 12))
      }),
      unit('E', { key: 'Z9', lastChangedMetadata: new Date(Date.UTC(2022, 4, 3, 12)) })
    ] : []));

    const [row] = await WorkspaceReportClass.build(workspaceService, unitService, 1);

    expect(row.lastChange).toBe('2026-10-30T12:00:00.000Z');
  });
});
