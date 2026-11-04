import { Injectable } from '@nestjs/common';
import { WorkspaceUserService } from '../services/workspace-user.service';
import { AccessLevelGuard } from './access-level.guard';

/**
 * One rung above {@link WorkspaceAccessGuard}: commenting takes an access level above the bare
 * assignment, so a user who may only read a workspace cannot write into its review.
 */
@Injectable()
export class CommentAccessGuard extends AccessLevelGuard {
  constructor(workspaceUserService: WorkspaceUserService) {
    super((userId, workspaceId) => workspaceUserService.canComment(userId, workspaceId));
  }
}
