import {
  CanActivate, ExecutionContext, ForbiddenException, Injectable
} from '@nestjs/common';
import { WorkspaceUserService } from '../services/workspace-user.service';

/**
 * Changing what is in a workspace -- units, their definitions, their metadata -- takes an access
 * level above commenting. See {@link WorkspaceAccessGuard} for the whole ladder.
 */
@Injectable()
export class WriteAccessGuard implements CanActivate {
  constructor(private workspaceUserService: WorkspaceUserService) {}

  /** Forbidden unless the user's access level in this workspace allows writing. */
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
