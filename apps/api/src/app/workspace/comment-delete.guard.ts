import {
  CanActivate, ExecutionContext, Injectable, UnauthorizedException
} from '@nestjs/common';
import { UnitService } from '../database/services/unit.service';

@Injectable()
export class CommentDeleteGuard implements CanActivate {
  constructor(
    private unitService: UnitService
  ) {}

  // eslint-disable-next-line class-methods-use-this
  async canActivate(
    context: ExecutionContext
  ) {
    const req = context.switchToHttp().getRequest();
    const userId = req.user.id;
    const commentId = req.params.id;
    const comment = await this.unitService.findOneComment(commentId);
    const canAccess = userId === comment.userId;
    if (!canAccess) {
      throw new UnauthorizedException();
    }
    return true;
  }
}
