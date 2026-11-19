import {
  CanActivate, ExecutionContext, ForbiddenException, Injectable
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { WorkspaceUserService } from '../services/workspace-user.service';

/**
 * Reading a workspace group (`GET workspace-groups/:workspace_group_id`): its settings, which a member
 * needs from inside their workspace -- the unit states, for one -- and which therefore pass for anyone
 * assigned to a workspace of the group, besides its admin and any administrator. The report over its
 * workspaces is a route of its own for the admin (#2181).
 *
 * The route used to ask for nothing but a valid token, so anyone logged in could read any group
 * (#1712).
 */
@Injectable()
export class WorkspaceGroupAccessGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private workspaceUserService: WorkspaceUserService
  ) {}

  /** Passes for the group's admin, an administrator and a member of a workspace of the group. */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const userId = Number(req.user?.id) || 0;
    const workspaceGroupId = Number(req.params.workspace_group_id) || 0;
    if (userId && workspaceGroupId) {
      if (await this.authService.isWorkspaceGroupAdmin(userId, workspaceGroupId)) return true;
      if (await this.workspaceUserService.hasAccessToWorkspaceGroup(userId, workspaceGroupId)) return true;
    }
    throw new ForbiddenException();
  }
}
