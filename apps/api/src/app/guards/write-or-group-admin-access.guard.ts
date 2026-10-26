import { Injectable } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { WorkspaceService } from '../services/workspace.service';
import { WorkspaceUserService } from '../services/workspace-user.service';
import { AccessLevelOrGroupAdminGuard } from './access-level-or-group-admin.guard';

/**
 * Writing in a workspace, for the assigned user with write access and for whoever administers the
 * workspace from outside -- see {@link ReadOrGroupAdminAccessGuard} for why this pair exists.
 */
@Injectable()
export class WriteOrGroupAdminAccessGuard extends AccessLevelOrGroupAdminGuard {
  constructor(
    authService: AuthService,
    workspaceService: WorkspaceService,
    workspaceUserService: WorkspaceUserService
  ) {
    super(
      authService,
      workspaceService,
      (userId, workspaceId) => workspaceUserService.canWrite(userId, workspaceId)
    );
  }
}
