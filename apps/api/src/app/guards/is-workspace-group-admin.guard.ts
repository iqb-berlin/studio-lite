import {
  CanActivate, ExecutionContext, ForbiddenException, Injectable
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../services/auth.service';
import { WorkspaceService } from '../services/workspace.service';
import { ANY_WORKSPACE_GROUP_ADMIN_KEY } from '../decorators/any-workspace-group-admin.decorator';

/**
 * Guards the group-admin area: the requesting user has to administer the workspace group the route
 * is about. A full administrator passes without further questions.
 *
 * The group is taken from whichever parameter the route carries -- `workspace_group_id` names it
 * directly, `workspace_id` names a workspace whose group is looked up.
 *
 * A route that names neither is refused, unless it carries {@link AnyWorkspaceGroupAdmin}: the
 * lists of the group-admin area are about no single group, and for those "administers any group at
 * all" is the intended question. That used to be the silent behaviour of every unresolved route --
 * the guard fell open where it was meant to close -- and is now something a route has to say.
 */
@Injectable()
export class IsWorkspaceGroupAdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private workspaceService: WorkspaceService,
    private reflector: Reflector
  ) {}

  /** Passes for an administrator, or for an admin of the group the route belongs to. */
  async canActivate(
    context: ExecutionContext
  ) {
    const req = context.switchToHttp().getRequest();
    const userId = req.user.id;
    const isAdmin = await this.authService.isAdminUser(userId);
    if (isAdmin) return true;
    const workspaceGroupId = await this.resolveWorkspaceGroupId(req.params);
    // A workspace that does not exist is refused like a foreign one (#2023)
    if (workspaceGroupId === 0) throw new ForbiddenException();
    if (workspaceGroupId === undefined) {
      // Read from the handler first, then the controller, so a whole controller can be marked.
      const isGroupless = this.reflector.getAllAndOverride<boolean>(
        ANY_WORKSPACE_GROUP_ADMIN_KEY,
        [context.getHandler(), context.getClass()]
      );
      if (!isGroupless) throw new ForbiddenException();
      const isAnyGroupAdmin = await this.authService.isWorkspaceGroupAdmin(userId);
      if (!isAnyGroupAdmin) throw new ForbiddenException();
      return true;
    }
    const isGroupAdmin = await this.authService.isWorkspaceGroupAdmin(userId, workspaceGroupId);
    if (!isGroupAdmin) throw new ForbiddenException();
    return true;
  }

  /**
   * The group the route is about, undefined when it names none, and 0 for a `workspace_id` that
   * belongs to no workspace. That one used to be answered with a 404 by
   * {@link WorkspaceService.findOne}, and a foreign one with 403, which told anyone which ids exist
   * (#2023, as #1930 for {@link AccessLevelOrGroupAdminGuard}).
   */
  private async resolveWorkspaceGroupId(params: { workspace_id?: string, workspace_group_id?: string }
  ): Promise<number | undefined> {
    if (params.workspace_id) {
      const [groupId] = await this.workspaceService.findGroupIdsOfWorkspaces([Number(params.workspace_id)]);
      return groupId || 0;
    }
    if (params.workspace_group_id) return Number(params.workspace_group_id);
    return undefined;
  }
}
