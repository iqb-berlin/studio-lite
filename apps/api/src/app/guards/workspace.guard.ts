import {
  CanActivate, ExecutionContext, Injectable, UnauthorizedException
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';

/**
 * Whether the user may enter this workspace at all. Unlike {@link WorkspaceAccessGuard}, which
 * asks the assignment table alone, this one also lets the admin of the workspace's group through,
 * who is not assigned to the workspace but administers it.
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
      throw new UnauthorizedException();
    }
    return true;
  }
}
