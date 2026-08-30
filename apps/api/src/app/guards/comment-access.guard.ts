import {
  CanActivate, ExecutionContext, ForbiddenException, Injectable
} from '@nestjs/common';
import { WorkspaceUserService } from '../services/workspace-user.service';

/**
 * One rung above {@link WorkspaceAccessGuard}: commenting takes an access level above the bare
 * assignment, so a user who may only read a workspace cannot write into its review.
 */
@Injectable()
export class CommentAccessGuard implements CanActivate {
  constructor(private workspaceUserService: WorkspaceUserService) {}

  /** Forbidden unless the user's access level in this workspace is above read-only. */
  async canActivate(
    context: ExecutionContext
  ) {
    const req = context.switchToHttp().getRequest();
    const userId = req.user.id;
    const workspaceId = req.params.workspace_id;
    const canAccess = await this.workspaceUserService.canComment(userId, workspaceId);
    if (!canAccess) {
      throw new ForbiddenException();
    }
    return canAccess;
  }
}
