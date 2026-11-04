import { CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

/** Asks `WorkspaceUserService` whether the user stands on one rung of the access ladder. */
export type AccessLevelCheck = (userId: number, workspaceId: number) => Promise<boolean>;

/**
 * One rung of the workspace access ladder described on {@link WorkspaceAccessGuard}: the user must
 * hold the rung's access level in the workspace in `route.params.workspace_id`.
 *
 * Which rung is up to the subclass -- it hands in the question to ask `WorkspaceUserService` --,
 * so the five guards of the ladder cannot come to read the request differently.
 */
export abstract class AccessLevelGuard implements CanActivate {
  /** @param hasLevel Whether the user holds the rung's level in the workspace. */
  protected constructor(private hasLevel: AccessLevelCheck) {}

  /** Forbidden unless the user holds the rung's access level in this workspace. */
  async canActivate(
    context: ExecutionContext
  ) {
    const req = context.switchToHttp().getRequest();
    const userId = req.user.id;
    const workspaceId = req.params.workspace_id;
    const canAccess = await this.hasLevel(userId, workspaceId);
    if (!canAccess) {
      throw new ForbiddenException();
    }
    return canAccess;
  }
}
