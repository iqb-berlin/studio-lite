import {
  CanActivate, ExecutionContext, ForbiddenException, Injectable
} from '@nestjs/common';
import { Request } from 'express';
import { WorkspaceService } from '../services/workspace.service';
import { unitIdOf } from '../utils/unit-ids';
import { isSubmissionBody } from '../utils/unit-request-body';

/**
 * Handing units in takes nothing more than comment access, because it hands them to the one drop
 * box the group admin chose for the workspace -- a workspace the caller need not be able to enter.
 * The target of the body therefore has to be that drop box (#1780); any other is forbidden, and
 * nothing is handed in. A return names no target and passes: it goes back to where the unit came
 * from.
 */
@Injectable()
export class DropBoxTargetGuard implements CanActivate {
  constructor(private workspaceService: WorkspaceService) {}

  /** Forbidden when the body names a target that is not the drop box of the workspace in the path. */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    if (!isSubmissionBody(req.body)) return true;
    const dropBoxId = await this.workspaceService.dropBoxIdOf(Number(req.params.workspace_id));
    // A workspace id is spelled like a unit id
    if (!dropBoxId || unitIdOf(req.body.targetId) !== dropBoxId) throw new ForbiddenException();
    return true;
  }
}
