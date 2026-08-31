import {
  CanActivate, ExecutionContext, Injectable, UnauthorizedException
} from '@nestjs/common';
import { UnitCommentService } from '../services/unit-comment.service';
import { AuthService } from '../services/auth.service';
import { WorkspaceService } from '../services/workspace.service';

/**
 * A comment may be deleted by whoever wrote it, and by whoever administers the workspace it is in --
 * the admin of its group, or an administrator. Comment access alone is not enough: it lets a user
 * write in the discussion, not remove what others wrote.
 *
 * The two halves are why the guard existed but was never used (the todo at the delete route asked
 * for exactly this): checking authorship alone would have shut out the group admin, who is the one
 * expected to clear a discussion up.
 *
 * A review session passes neither half -- its comments carry no user id and it administers nothing.
 */
@Injectable()
export class CommentDeleteGuard implements CanActivate {
  constructor(
    private unitCommentService: UnitCommentService,
    private authService: AuthService,
    private workspaceService: WorkspaceService
  ) {}

  /** Passes for the author of the comment, for an administrator, and for the group's admin. */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const userId = Number(req.user?.id) || 0;
    const commentId = Number(req.params.id ?? req.params.comment_id) || 0;
    if (!userId || !commentId) throw new UnauthorizedException();

    const comment = await this.unitCommentService.findOneComment(commentId);
    if (comment.userId === userId) return true;

    if (await this.authService.isAdminUser(userId)) return true;
    if (await this.isGroupAdminOfWorkspace(userId, Number(req.params.workspace_id) || 0)) return true;

    throw new UnauthorizedException();
  }

  /** Whether the user administers the group the workspace belongs to. False without a workspace. */
  private async isGroupAdminOfWorkspace(userId: number, workspaceId: number): Promise<boolean> {
    if (!workspaceId) return false;
    const workspace = await this.workspaceService.findOne(workspaceId);
    if (!workspace) return false;
    return this.authService.isWorkspaceGroupAdmin(userId, workspace.groupId);
  }
}
