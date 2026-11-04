import { Injectable } from '@nestjs/common';
import { WorkspaceUserService } from '../services/workspace-user.service';
import { AccessLevelGuard } from './access-level.guard';

/**
 * The top of the ladder (see {@link WorkspaceAccessGuard}), and the only rung asked for by an
 * exact level rather than a minimum: deleting takes the highest access level there is, so no
 * future level above it silently inherits the right to delete.
 */
@Injectable()
export class DeleteAccessGuard extends AccessLevelGuard {
  constructor(workspaceUserService: WorkspaceUserService) {
    super((userId, workspaceId) => workspaceUserService.canDelete(userId, workspaceId));
  }
}
