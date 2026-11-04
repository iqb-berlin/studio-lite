import { Injectable } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { WorkspaceService } from '../services/workspace.service';
import { WorkspaceUserService } from '../services/workspace-user.service';
import { AccessLevelOrGroupAdminGuard } from './access-level-or-group-admin.guard';

/**
 * Managing a workspace, for the assigned user with manage access and for whoever administers the
 * workspace from outside -- see {@link ReadOrGroupAdminAccessGuard} for why this pair exists.
 */
@Injectable()
export class ManageOrGroupAdminAccessGuard extends AccessLevelOrGroupAdminGuard {
  constructor(
    authService: AuthService,
    workspaceService: WorkspaceService,
    workspaceUserService: WorkspaceUserService
  ) {
    super(
      authService,
      workspaceService,
      (userId, workspaceId) => workspaceUserService.canManage(userId, workspaceId)
    );
  }
}
