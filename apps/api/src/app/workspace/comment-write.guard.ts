import {
  CanActivate, ExecutionContext, Injectable, UnauthorizedException
} from '@nestjs/common';

@Injectable()
export class CommentWriteGuard implements CanActivate {
  // eslint-disable-next-line class-methods-use-this
  async canActivate(
    context: ExecutionContext
  ) {
    const req = context.switchToHttp().getRequest();
    const userId = req.user.id;
    const commentUserId = req.body.userId;
    const canAccess = userId === commentUserId;
    if (!canAccess) {
      throw new UnauthorizedException();
    }
    return true;
  }
}
