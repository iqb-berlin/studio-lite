import {
  UnitPropertiesDto, WorkspaceGroupDto, WorkspaceReportDto
} from '@studio-lite-lib/api-dto';
import { WorkspaceService } from '../services/workspace.service';
import { UnitService } from '../services/unit.service';

/**
 * The report over the workspaces of a group, or of all groups: per workspace its units, their newest
 * change and how many of them use which editor, player and schemer. The interface turns it into an
 * Excel file in its own language (#2181).
 */
export class WorkspaceReportClass {
  /** The workspaces of the group `workspaceGroupId`; 0 stands for every group. */
  static async build(
    workspaceService: WorkspaceService,
    unitService: UnitService,
    workspaceGroupId: number
  ): Promise<WorkspaceReportDto[]> {
    const groups = await workspaceService.findAllGroupwise();
    return Promise.all(groups
      .filter(group => workspaceGroupId === 0 || group.id === workspaceGroupId)
      .flatMap(group => group.workspaces.map(async workspace => WorkspaceReportClass.row(
        group, workspace, await unitService.findAllWithProperties(workspace.id)
      ))));
  }

  private static row(
    group: WorkspaceGroupDto,
    workspace: { id: number; name: string },
    units: UnitPropertiesDto[]
  ): WorkspaceReportDto {
    // The newest change across all units, not the change of the last one (#1983)
    const lastChange = units
      .flatMap(unit => [unit.lastChangedMetadata, unit.lastChangedDefinition, unit.lastChangedScheme])
      .reduce<Date | null>(
        (latest, changed) => (changed && (!latest || changed > latest) ? changed : latest),
        null
      );
    return {
      groupId: group.id,
      groupName: group.name,
      workspaceId: workspace.id,
      workspaceName: workspace.name,
      lastChange: lastChange ? new Date(lastChange).toISOString() : null,
      unitCount: units.length,
      editors: WorkspaceReportClass.countBy(units, unit => unit.editor),
      players: WorkspaceReportClass.countBy(units, unit => unit.player),
      schemers: WorkspaceReportClass.countBy(units, unit => unit.schemer)
    };
  }

  /** How many units use each module; a unit without one counts under ''. */
  private static countBy(
    units: UnitPropertiesDto[],
    moduleOf: (unit: UnitPropertiesDto) => string | undefined | null
  ): Record<string, number> {
    return units.reduce<Record<string, number>>((counts, unit) => {
      const module = moduleOf(unit) || '';
      counts[module] = (counts[module] ?? 0) + 1;
      return counts;
    }, {});
  }
}
