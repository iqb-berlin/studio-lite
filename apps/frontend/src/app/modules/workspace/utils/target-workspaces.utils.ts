import { WorkspaceGroupDto } from '@studio-lite-lib/api-dto';

/** A workspace units can be copied or moved to, with the group it belongs to. */
export interface TargetWorkspace {
  id: number;
  name: string;
  groupId: number;
  groupName: string;
}

/**
 * The workspaces units of the one open can be copied or moved to: every other workspace in which the
 * user is more than a developer. The server asks that much of the target of a move (`MoveTargetAccessGuard`),
 * and the studio leaves bringing in units from elsewhere to them, as it does with a new unit from an existing
 * one. Asked by the dialog that copies and moves many units and by the card that does so with one (#2232).
 */
export function targetWorkspaces(groups: WorkspaceGroupDto[], currentWorkspaceId: number): TargetWorkspace[] {
  return groups.flatMap(group => group.workspaces
    .filter(workspace => workspace.id !== currentWorkspaceId && workspace.userAccessLevel > 2)
    .map(workspace => ({
      id: workspace.id, name: workspace.name, groupId: group.id, groupName: group.name
    })));
}
