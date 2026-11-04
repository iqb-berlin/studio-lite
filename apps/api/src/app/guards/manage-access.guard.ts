import { Injectable } from '@nestjs/common';
import { WorkspaceUserService } from '../services/workspace-user.service';
import { AccessLevelGuard } from './access-level.guard';

/**
 * Managing a workspace -- its settings, its module choices, its people -- takes an access level
 * above writing. See {@link WorkspaceAccessGuard} for the whole ladder.
 */
@Injectable()
export class ManageAccessGuard extends AccessLevelGuard {
  constructor(workspaceUserService: WorkspaceUserService) {
    super((userId, workspaceId) => workspaceUserService.canManage(userId, workspaceId));
  }
}
