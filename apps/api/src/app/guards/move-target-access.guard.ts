import {
  CanActivate, ExecutionContext, ForbiddenException, Injectable
} from '@nestjs/common';
import { Request } from 'express';
import { WorkspaceUserService } from '../services/workspace-user.service';
import { unitIdOf } from '../utils/unit-ids';

/**
 * Moving units asks about two workspaces: the guards of the route hold the caller to the source in
 * the path, this one to the target in the body (#1780). There the caller has to be able to manage
 * units -- the level the frontend asks of a target it offers. Otherwise the request is forbidden
 * and nothing is moved.
 */
@Injectable()
export class MoveTargetAccessGuard implements CanActivate {
  constructor(private workspaceUserService: WorkspaceUserService) {}

  /** Forbidden unless the user can manage units in the workspace `body.targetId`. */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request & { user: { id: number } }>();
    // A workspace id is spelled like a unit id; a malformed one is refused without a query
    const targetId = unitIdOf(req.body?.targetId);
    if (!targetId || !(await this.workspaceUserService.canManage(req.user.id, targetId))) {
      throw new ForbiddenException();
    }
    return true;
  }
}
