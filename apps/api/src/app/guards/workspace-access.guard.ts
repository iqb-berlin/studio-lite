import { Injectable } from '@nestjs/common';
import { WorkspaceUserService } from '../services/workspace-user.service';
import { AccessLevelGuard } from './access-level.guard';

/**
 * The lowest rung of the workspace access ladder: the user must be assigned to the workspace in
 * `route.params.workspace_id`, at whatever level. Reading is all that follows from it.
 *
 * The ladder is one access level per user and workspace, and each guard names the rung it needs:
 * assigned at all (this one), {@link CommentAccessGuard} above it, then
 * {@link WriteAccessGuard}, {@link ManageAccessGuard}, {@link DeleteAccessGuard}. A workspace
 * group admin is NOT covered here -- the `…OrGroupAdmin…` variants exist for routes that let one
 * in.
 */
@Injectable()
export class WorkspaceAccessGuard extends AccessLevelGuard {
  constructor(workspaceUserService: WorkspaceUserService) {
    super((userId, workspaceId) => workspaceUserService.hasAccess(userId, workspaceId));
  }
}
