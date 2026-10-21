import {
  CanActivate, ExecutionContext, Injectable
} from '@nestjs/common';
import { UnitService } from '../services/unit.service';
import { UnitNotFoundException } from '../exceptions/unit-not-found.exception';
import { unitIdOf } from '../utils/unit-ids';

/**
 * A unit is only found in the workspace it is in: the route `workspaces/:workspace_id/units/
 * :unit_id/...` names both, and this guard holds the route to it. Under any other workspace the
 * unit is answered as not being there, a 404.
 *
 * It closes a gap, not merely the path's tidiness. {@link WorkspaceGuard} and the access-level
 * guards ask about the workspace in the path alone, so without this one a member of one workspace
 * could read and write the discussion on a unit of any other by naming that unit's id.
 *
 * It runs after a guard that admits the caller to the workspace -- {@link WorkspaceGuard}, or
 * {@link IsWorkspaceGroupAdminGuard} where a route is the group admin's (deleting a unit). So it
 * only ever answers someone who may see the workspace, and tells them no more than which units are
 * in it, which they can list anyway. A route that puts it first would let anyone ask whether a unit
 * exists in any workspace.
 */
@Injectable()
export class UnitInWorkspaceGuard implements CanActivate {
  constructor(private unitService: UnitService) {}

  /** Passes when the unit in the route is in the workspace in the route. */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    // A malformed id is not looked up but refused, and reported as unit 0 (see unitIdOf).
    const unitId = unitIdOf(req.params.unit_id);
    const workspaceId = Number(req.params.workspace_id) || 0;
    if (!unitId || !await this.unitService.isInWorkspace(unitId, workspaceId)) {
      throw new UnitNotFoundException(unitId, workspaceId, req.method);
    }
    return true;
  }
}
