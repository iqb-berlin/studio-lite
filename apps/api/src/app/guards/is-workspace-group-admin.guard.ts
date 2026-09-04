import {
  CanActivate, ExecutionContext, Injectable, UnauthorizedException
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
    if (!workspaceGroupId) {
      // Read from the handler first, then the controller, so a whole controller can be marked.
      const isGroupless = this.reflector.getAllAndOverride<boolean>(
        ANY_WORKSPACE_GROUP_ADMIN_KEY,
        [context.getHandler(), context.getClass()]
      );
      if (!isGroupless) throw new UnauthorizedException();
      const isAnyGroupAdmin = await this.authService.isWorkspaceGroupAdmin(userId);
      if (!isAnyGroupAdmin) throw new UnauthorizedException();
      return true;
    }
    const isGroupAdmin = await this.authService.isWorkspaceGroupAdmin(userId, workspaceGroupId);
    if (!isGroupAdmin) throw new UnauthorizedException();
    return true;
  }

  /**
   * The group the route is about, or 0 when it names none. A `workspace_id` that belongs to no
   * workspace does not end up here: {@link WorkspaceService.findOne} answers that with a 404.
   */
  private async resolveWorkspaceGroupId(params: { workspace_id?: string, workspace_group_id?: string }
  ): Promise<number> {
    if (params.workspace_id) {
      const workspaceData = await this.workspaceService.findOne(Number(params.workspace_id));
      return workspaceData ? workspaceData.groupId : 0;
    }
    if (params.workspace_group_id) return Number(params.workspace_group_id);
    return 0;
  }
}
