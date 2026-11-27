import { Pipe, PipeTransform } from '@angular/core';
import { WorkspaceInListDto } from '@studio-lite-lib/api-dto';

/**
 * The name of the drop box set for a workspace, empty when it has none that counts: none set, one that is
 * not among the workspaces of the group (deleted, or left in another group by a move before #2027), or the
 * workspace itself. The workspace treats such a drop box as none and offers no submission (`dropBoxOf` in
 * the API's `WorkspaceService`), so the group admin's table shows none either (#2251).
 */
export const dropBoxName = (
  dropBoxId: number | null | undefined,
  workspaceId: number,
  workspaces: WorkspaceInListDto[]
): string => {
  if (!dropBoxId || dropBoxId === workspaceId) return '';
  return workspaces.find(workspace => workspace.id === dropBoxId)?.name || '';
};

/** {@link dropBoxName} for the template. */
@Pipe({
  name: 'dropBoxName',
  standalone: true
})
export class DropBoxNamePipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(dropBoxId: number | null | undefined, workspaceId: number, workspaces: WorkspaceInListDto[]): string {
    return dropBoxName(dropBoxId, workspaceId, workspaces);
  }
}
