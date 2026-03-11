import {
  CanActivate, ExecutionContext, Injectable, UnauthorizedException
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { WorkspaceService } from '../services/workspace.service';
import { WorkspaceUserService } from '../services/workspace-user.service';

@Injectable()
export class ReadOrGroupAdminAccessGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private workspaceService: WorkspaceService,
    private workspaceUserService: WorkspaceUserService
  ) {}

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
