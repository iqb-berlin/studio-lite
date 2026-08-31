import {
  CanActivate, ExecutionContext, Injectable, UnauthorizedException
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';

/**
 * The whole administration area behind one flag: only a user marked as an administrator gets past.
 * Unrelated to any workspace, so it asks no route parameter.
 */
@Injectable()
export class IsAdminGuard implements CanActivate {
  constructor(
    private authService: AuthService
  ) {}

  /** Passes only for an administrator. */
  async canActivate(
    context: ExecutionContext
  ) {
    const req = context.switchToHttp().getRequest();
    const userId = req.user.id;
    const isAdmin = await this.authService.isAdminUser(userId);
    if (!isAdmin) {
      throw new UnauthorizedException();
    }
    return true;
  }
}
