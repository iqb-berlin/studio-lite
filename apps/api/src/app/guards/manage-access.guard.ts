import {
  CanActivate, ExecutionContext, ForbiddenException, Injectable
} from '@nestjs/common';
import { WorkspaceUserService } from '../services/workspace-user.service';

/**
 * Managing a workspace -- its settings, its module choices, its people -- takes an access level
 * above writing. See {@link WorkspaceAccessGuard} for the whole ladder.
 */
@Injectable()
export class ManageAccessGuard implements CanActivate {
  constructor(private workspaceUserService: WorkspaceUserService) {}

  /** Forbidden unless the user's access level in this workspace allows managing it. */
  async canActivate(
    context: ExecutionContext
  ) {
    const req = context.switchToHttp().getRequest();
    const userId = req.user.id;
    const workspaceId = req.params.workspace_id;
    const canAccess = await this.workspaceUserService.canManage(userId, workspaceId);
    if (!canAccess) {
      throw new ForbiddenException();
    }
    return canAccess;
  }
}
