import {
  CanActivate, ExecutionContext, ForbiddenException, Injectable
} from '@nestjs/common';
import { WorkspaceUserService } from '../services/workspace-user.service';

/**
 * The top of the ladder (see {@link WorkspaceAccessGuard}), and the only rung asked for by an
 * exact level rather than a minimum: deleting takes the highest access level there is, so no
 * future level above it silently inherits the right to delete.
 */
@Injectable()
export class DeleteAccessGuard implements CanActivate {
  constructor(private workspaceUserService: WorkspaceUserService) {}

  /** Forbidden unless the user holds the highest access level in this workspace. */
  async canActivate(
    context: ExecutionContext
  ) {
    const req = context.switchToHttp().getRequest();
    const userId = req.user.id;
    const workspaceId = req.params.workspace_id;
    const canAccess = await this.workspaceUserService.canDelete(userId, workspaceId);
    if (!canAccess) {
      throw new ForbiddenException();
    }
    return canAccess;
  }
}
