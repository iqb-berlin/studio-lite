import { Injectable } from '@nestjs/common';
import { WorkspaceUserService } from '../services/workspace-user.service';
import { AccessLevelGuard } from './access-level.guard';

/**
 * Changing what is in a workspace -- units, their definitions, their metadata -- takes an access
 * level above commenting. See {@link WorkspaceAccessGuard} for the whole ladder.
 */
@Injectable()
export class WriteAccessGuard extends AccessLevelGuard {
  constructor(workspaceUserService: WorkspaceUserService) {
    super((userId, workspaceId) => workspaceUserService.canWrite(userId, workspaceId));
  }
}
