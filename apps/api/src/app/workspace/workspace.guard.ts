import {CanActivate, ExecutionContext, Injectable, UnauthorizedException} from '@nestjs/common';
import {AuthService} from "../auth/service/auth.service";

@Injectable()
export class WorkspaceGuard implements CanActivate {
  constructor(
    private authService: AuthService
  ) {}

  async canActivate(
    context: ExecutionContext,
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
