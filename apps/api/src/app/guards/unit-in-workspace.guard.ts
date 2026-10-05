import {
  CanActivate, ExecutionContext, Injectable
} from '@nestjs/common';
import { UnitService } from '../services/unit.service';
import { UnitNotFoundException } from '../exceptions/unit-not-found.exception';

/** A unit id as the path has to spell it: digits, no sign, no leading zero, no blanks. */
const UNIT_ID = /^[1-9]\d*$/;

/**
 * A unit is only found in the workspace it is in: the route `workspaces/:workspace_id/units/
 * :unit_id/...` names both, and this guard holds the route to it. Under any other workspace the
 * unit is answered as not being there, a 404.
 *
 * It closes a gap, not merely the path's tidiness. {@link WorkspaceGuard} and the access-level
 * guards ask about the workspace in the path alone, so without this one a member of one workspace
 * could read and write the discussion on a unit of any other by naming that unit's id.
 *
 * It runs after {@link WorkspaceGuard}, so it only ever answers a caller who may enter the
 * workspace -- and tells them no more than which units are in it, which they can list anyway.
 */
@Injectable()
export class UnitInWorkspaceGuard implements CanActivate {
  constructor(private unitService: UnitService) {}

  /** Passes when the unit in the route is in the workspace in the route. */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    // A malformed id is not looked up but refused (#1696): `Number('abc') || 0` once read as
    // "no unit given" and skipped the check instead. It is reported as unit 0, not as whatever
    // `Number` makes of it (`0xa` would be 10).
    const unitId = UNIT_ID.test(req.params.unit_id ?? '') ? Number(req.params.unit_id) : 0;
    const workspaceId = Number(req.params.workspace_id) || 0;
    if (!unitId || !await this.unitService.isInWorkspace(unitId, workspaceId)) {
      throw new UnitNotFoundException(unitId, workspaceId, req.method);
    }
    return true;
  }
}
