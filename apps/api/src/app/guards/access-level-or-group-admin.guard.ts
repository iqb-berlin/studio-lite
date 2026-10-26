import { CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { WorkspaceService } from '../services/workspace.service';
import { AccessLevelCheck } from './access-level.guard';

/**
 * One rung of the workspace access ladder (see {@link WorkspaceAccessGuard}), opened as well to
 * whoever administers the workspace from outside: a full administrator or the admin of its group.
 * See {@link ReadOrGroupAdminAccessGuard} for why these guards exist.
 *
 * Which rung is up to the subclass -- it hands in the question to ask `WorkspaceUserService` --,
 * so the three guards cannot come to let a different set of people in.
 */
export abstract class AccessLevelOrGroupAdminGuard implements CanActivate {
  /** @param hasLevel Whether the user holds the rung's level in the workspace. */
  protected constructor(
    private authService: AuthService,
    private workspaceService: WorkspaceService,
    private hasLevel: AccessLevelCheck
  ) {}

  /**
   * Passes for the rung's access level, for an administrator, or for the group admin. A route
   * without `workspace_id` never passes: there is no workspace to be admin of.
   */
  async canActivate(
    context: ExecutionContext
  ) {
    const req = context.switchToHttp().getRequest();
    const userId = req.user.id;
    const workspaceId = req.params.workspace_id;

    if (workspaceId) {
      const isOnRung = await this.hasLevel(userId, workspaceId);
      if (isOnRung) return true;

      const isAdmin = await this.authService.isAdminUser(userId);
      if (isAdmin) return true;

      const workspaceData = await this.workspaceService.findOne(workspaceId);
      if (workspaceData) {
        const isGroupAdmin = await this.authService.isWorkspaceGroupAdmin(userId, workspaceData.groupId);
        if (isGroupAdmin) return true;
      }
    }

    throw new ForbiddenException();
  }
}
