import {
  CanActivate, ExecutionContext, ForbiddenException, Injectable
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';

/**
 * Whether the user may enter this workspace at all. Unlike {@link WorkspaceAccessGuard}, which
 * asks the assignment table alone, this one also lets the admin of the workspace's group through,
 * who is not assigned to the workspace but administers it.
 *
 * A refusal is a 403: the user is known, the token is valid, only the workspace is not theirs. It
 * used to be a 401, which the frontend took for an expired session and answered with a token
 * refresh and a second attempt (#1694, #1706). The same holds for every guard in this folder that
 * decides about permissions; a 401 is left to the authentication itself -- `JwtAuthGuard` for a
 * request without a valid token, `LocalAuthGuard` for a failed login.
 */
@Injectable()
export class WorkspaceGuard implements CanActivate {
  constructor(
    private authService: AuthService
  ) {}

  /** Passes when the user may reach the workspace in `route.params.workspace_id`. */
  async canActivate(
    context: ExecutionContext
  ) {
    const req = context.switchToHttp().getRequest();
    const userId = req.user.id;
    const params = req.params;
    const canAccess = await this.authService.canAccessWorkSpace(userId, params.workspace_id);
    if (!canAccess) {
      throw new ForbiddenException();
    }
    return true;
  }
}
