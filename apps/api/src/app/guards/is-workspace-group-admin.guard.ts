import {
  CanActivate, ExecutionContext, Injectable, UnauthorizedException
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { WorkspaceService } from '../services/workspace.service';

/**
 * Guards the group-admin area: the requesting user has to administer the workspace group the route
 * is about. A full administrator passes without further questions.
 *
 * The group is taken from whichever parameter the route carries -- `workspace_group_id` names it
 * directly, `workspace_id` names a workspace whose group is looked up.
 *
 * Careful with a route that carries neither, or a `workspace_id` that names no workspace: the group
 * stays unresolved, and the check then asks whether the user administers ANY group at all
 * ({@link UsersService.isWorkspaceGroupAdmin} without an id). It fails open, so a route guarded by
 * this must name the group it is about.
 */
@Injectable()
export class IsWorkspaceGroupAdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private workspaceService: WorkspaceService
  ) {}

  /** Passes for an administrator, or for an admin of the group the route belongs to. */
  async canActivate(
    context: ExecutionContext
  ) {
    const req = context.switchToHttp().getRequest();
    const userId = req.user.id;
    const isAdmin = await this.authService.isAdminUser(userId);
    if (isAdmin) return true;
    const params = req.params;
    let workspaceGroupId = 0;
    if (params.workspace_id) {
      const workspaceData = await this.workspaceService.findOne(params.workspace_id);
      if (workspaceData) workspaceGroupId = workspaceData.groupId;
    } else if (params.workspace_group_id) {
      workspaceGroupId = params.workspace_group_id;
    }
    const isGroupAdmin = await this.authService.isWorkspaceGroupAdmin(userId, workspaceGroupId || undefined);
    if (!isGroupAdmin) throw new UnauthorizedException();
    return true;
  }
}
