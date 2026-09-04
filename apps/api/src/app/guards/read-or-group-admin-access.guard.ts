import {
  CanActivate, ExecutionContext, Injectable, UnauthorizedException
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { WorkspaceService } from '../services/workspace.service';
import { WorkspaceUserService } from '../services/workspace-user.service';

/**
 * Reading a workspace, for the two kinds of people who may: someone assigned to it, and someone
 * who administers it without being in it -- a full administrator or the admin of its group.
 *
 * The three `…OrGroupAdmin…` guards are the same shape at three rungs of the ladder described on
 * {@link WorkspaceAccessGuard}; they exist because a group admin has no access level in the
 * workspace at all and would fail the plain guards.
 */
@Injectable()
export class ReadOrGroupAdminAccessGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private workspaceService: WorkspaceService,
    private workspaceUserService: WorkspaceUserService
  ) {}

  /**
   * Passes for an assigned user, an administrator, or the group admin. A route without
   * `workspace_id` never passes: there is no workspace to be admin of.
   */
  async canActivate(
    context: ExecutionContext
  ) {
    const req = context.switchToHttp().getRequest();
    const userId = req.user.id;
    const workspaceId = req.params.workspace_id;

    if (workspaceId) {
      // Check for normal Read access (Entry exists)
      const hasAccess = await this.workspaceUserService.hasAccess(userId, workspaceId);
      if (hasAccess) return true;

      // Check for Admin or Workspace Group Admin
      const isAdmin = await this.authService.isAdminUser(userId);
      if (isAdmin) return true;

      const workspaceData = await this.workspaceService.findOne(workspaceId);
      if (workspaceData) {
        const isGroupAdmin = await this.authService.isWorkspaceGroupAdmin(userId, workspaceData.groupId);
        if (isGroupAdmin) return true;
      }
    }

    throw new UnauthorizedException();
  }
}
