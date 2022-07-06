import {
  CanActivate, ExecutionContext, Injectable, UnauthorizedException
} from '@nestjs/common';
import { AuthService } from '../auth/service/auth.service';
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
    const params = req.params;
    let workspaceGroupId = 0;
    if (params.workspace_id) {
      const workspaceData = await this.workspaceService.findOne(params.workspace_id);
      if (workspaceData) workspaceGroupId = workspaceData.groupId;
    } else if (params.workspace_group_id) {
      workspaceGroupId = params.workspace_group_id;
    }
    if (workspaceGroupId <= 0) throw new UnauthorizedException();
    const isGroupAdmin = await this.authService.isWorkspaceGroupAdmin(userId, workspaceGroupId);
    if (!isGroupAdmin) throw new UnauthorizedException();
    return true;
  }
}
