import {
  CanActivate, ExecutionContext, Injectable
} from '@nestjs/common';
import { UnitService } from '../services/unit.service';
import { unitIdsOfList } from '../utils/unit-ids';
import { assertUnitsInWorkspace } from '../utils/units-in-workspace';

/**
 * The counterpart of {@link UnitInWorkspaceGuard} for routes that name their units in the body, as
 * `ids`: all of them have to be in the workspace of the path (#1775). Otherwise the request is
 * answered with a 404 for the first unit that is not, and nothing of it is carried out -- not the
 * units that would have been fine either.
 *
 * It reads the body alone, because that is all these routes act on: moving, submitting to and
 * returning from a drop box. A route that takes its units from the query has
 * {@link QueryUnitsInWorkspaceGuard} -- a guard that read either would let a request name one set
 * of units to the guard and another to the handler.
 *
 * For all of these routes the path names the workspace the units are in at that moment: the
 * source when moving or submitting, the drop box when returning. Copying is not among them -- its
 * path names the target (#1779).
 */
@Injectable()
export class UnitsInWorkspaceGuard implements CanActivate {
  constructor(private unitService: UnitService) {}

  /** Passes when every unit of the body is in the workspace in the route. */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    await assertUnitsInWorkspace(
      this.unitService,
      unitIdsOfList(req.body?.ids),
      Number(req.params.workspace_id) || 0,
      req.method
    );
    return true;
  }
}
