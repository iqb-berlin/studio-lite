import {
  CanActivate, ExecutionContext, Injectable, UnauthorizedException
} from '@nestjs/common';

/**
 * Stops a client from posting a comment under someone else's name: the `userId` in the body has to
 * be the one the token was issued for.
 *
 * It reads the body and nothing else. In particular it does not load the comment named in the
 * route, so on a PATCH it establishes only that the sender named themselves -- not that the comment
 * they are changing is theirs.
 */
@Injectable()
export class CommentWriteGuard implements CanActivate {
  /** Passes when the body's `userId` is the requesting user. */
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
