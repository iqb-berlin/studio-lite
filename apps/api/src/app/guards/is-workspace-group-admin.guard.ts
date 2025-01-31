import {
  CanActivate, ExecutionContext, Injectable, UnauthorizedException
} from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { WorkspaceService } from '../database/services/workspace.service';

@Injectable()
export class IsWorkspaceGroupAdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private workspaceService: WorkspaceService
  ) {}

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
