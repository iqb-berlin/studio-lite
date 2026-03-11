import {
  CanActivate, ExecutionContext, Injectable, UnauthorizedException
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { WorkspaceService } from '../services/workspace.service';
import { WorkspaceUserService } from '../services/workspace-user.service';

@Injectable()
export class WriteOrGroupAdminAccessGuard implements CanActivate {
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
