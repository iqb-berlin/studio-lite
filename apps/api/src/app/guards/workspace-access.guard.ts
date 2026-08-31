import {
  CanActivate, ExecutionContext, ForbiddenException, Injectable
} from '@nestjs/common';
import { WorkspaceUserService } from '../services/workspace-user.service';

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
export class WorkspaceAccessGuard implements CanActivate {
  constructor(private workspaceUserService: WorkspaceUserService) {}

  /** Forbidden unless the user holds any access level in this workspace. */
  async canActivate(
    context: ExecutionContext
  ) {
    const req = context.switchToHttp().getRequest();
    const userId = req.user.id;
    const workspaceId = req.params.workspace_id;
    const canAccess = await this.workspaceUserService.hasAccess(userId, workspaceId);
    if (!canAccess) {
      throw new ForbiddenException();
    }
    return canAccess;
  }
}
