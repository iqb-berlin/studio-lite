import { Injectable } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { WorkspaceService } from '../services/workspace.service';
import { WorkspaceUserService } from '../services/workspace-user.service';
import { AccessLevelOrGroupAdminGuard } from './access-level-or-group-admin.guard';

/**
 * Reading a workspace, for the two kinds of people who may: someone assigned to it, and someone
 * who administers it without being in it -- a full administrator or the admin of its group.
 *
 * The three `…OrGroupAdmin…` guards are the same shape at three rungs of the ladder described on
 * {@link WorkspaceAccessGuard}; they exist because a group admin has no access level in the
 * workspace at all and would fail the plain guards.
 */
@Injectable()
export class ReadOrGroupAdminAccessGuard extends AccessLevelOrGroupAdminGuard {
  constructor(
    authService: AuthService,
    workspaceService: WorkspaceService,
    workspaceUserService: WorkspaceUserService
  ) {
    super(
      authService,
      workspaceService,
      (userId, workspaceId) => workspaceUserService.hasAccess(userId, workspaceId)
    );
  }
}
