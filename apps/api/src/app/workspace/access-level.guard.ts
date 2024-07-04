import {
  CanActivate, ExecutionContext, ForbiddenException, Injectable
} from '@nestjs/common';
import { WorkspaceUserService } from '../database/services/workspace-user.service';

@Injectable()
export class AccessLevelGuard implements CanActivate {
  constructor(private workspaceUserService: WorkspaceUserService) {}

  async canActivate(
    context: ExecutionContext
  ) {
    const req = context.switchToHttp().getRequest();
    const userId = req.user.id;
    const workspaceId = req.params.workspace_id;
    const canAccess = await this.workspaceUserService.canWrite(userId, workspaceId);
    if (!canAccess) {
      throw new ForbiddenException();
    }
    return canAccess;
  }
}
