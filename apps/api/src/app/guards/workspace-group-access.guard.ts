import {
  CanActivate, ExecutionContext, ForbiddenException, Injectable
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { WorkspaceUserService } from '../services/workspace-user.service';

/**
 * Reading a workspace group (`GET workspace-groups/:workspace_group_id`), which answers two ways:
 *
 * - its settings, which a member needs from inside their workspace -- the unit states, for one --
 *   and which therefore pass for anyone assigned to a workspace of the group;
 * - with `download`, the report over all its workspaces, which is group administration and passes
 *   only for the group's admin or an administrator.
 *
 * The route used to ask for nothing but a valid token, so anyone logged in could read any group
 * and download its report (#1712).
 *
 * `download` counts as set whenever it is non-empty, exactly as the controller reads it -- a
 * narrower reading here would let `?download=false` past the guard into the report.
 */
@Injectable()
export class WorkspaceGroupAccessGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private workspaceUserService: WorkspaceUserService
  ) {}

  /** Passes for the group's admin and an administrator; for a member only without `download`. */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const userId = Number(req.user?.id) || 0;
    const workspaceGroupId = Number(req.params.workspace_group_id) || 0;
    if (userId && workspaceGroupId) {
      if (await this.authService.isWorkspaceGroupAdmin(userId, workspaceGroupId)) return true;
      const wantsReport = !!req.query?.download;
      if (!wantsReport && await this.workspaceUserService.hasAccessToWorkspaceGroup(userId, workspaceGroupId)) {
        return true;
      }
    }
    throw new ForbiddenException();
  }
}
