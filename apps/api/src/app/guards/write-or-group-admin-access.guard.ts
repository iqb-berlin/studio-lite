import {
  CanActivate, ExecutionContext, Injectable, UnauthorizedException
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { WorkspaceService } from '../services/workspace.service';
import { WorkspaceUserService } from '../services/workspace-user.service';

/**
 * Writing in a workspace, for the assigned user with write access and for whoever administers the
 * workspace from outside -- see {@link ReadOrGroupAdminAccessGuard} for why this pair exists.
 */
@Injectable()
export class WriteOrGroupAdminAccessGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private workspaceService: WorkspaceService,
    private workspaceUserService: WorkspaceUserService
  ) {}

  /**
   * Passes for write access, for an administrator, or for the group admin. A route without
   * `workspace_id` never passes.
   */
  async canActivate(
    context: ExecutionContext
  ) {
    const req = context.switchToHttp().getRequest();
    const userId = req.user.id;
    const params = req.params;

    if (params.workspace_id) {
      // Check for normal write access (Level > 1)
      const canWrite = await this.workspaceUserService.canWrite(userId, params.workspace_id);
      if (canWrite) return true;

      // Check for Admin or Workspace Group Admin
      const isAdmin = await this.authService.isAdminUser(userId);
      if (isAdmin) return true;

      const workspaceData = await this.workspaceService.findOne(params.workspace_id);
      if (workspaceData) {
        const isGroupAdmin = await this.authService.isWorkspaceGroupAdmin(userId, workspaceData.groupId);
        if (isGroupAdmin) return true;
      }
    }

    throw new UnauthorizedException();
  }
}
