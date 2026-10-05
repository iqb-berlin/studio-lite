import {
  CanActivate, ExecutionContext, Injectable
} from '@nestjs/common';
import { UnitService } from '../services/unit.service';
import { unitIdsOfQuery } from '../utils/unit-ids';
import { assertUnitsInWorkspace } from '../utils/units-in-workspace';

/**
 * {@link UnitsInWorkspaceGuard} for a route that takes its units from the comma-separated `id` of
 * the query -- deleting units. Every one of them has to be in the workspace of the path (#1775),
 * otherwise the request is answered with a 404 and nothing is deleted.
 *
 * It reads the query alone, as the route does: a body sent along is not what gets deleted.
 */
@Injectable()
export class QueryUnitsInWorkspaceGuard implements CanActivate {
  constructor(private unitService: UnitService) {}

  /** Passes when every unit of the query is in the workspace in the route. */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    await assertUnitsInWorkspace(
      this.unitService,
      unitIdsOfQuery(req.query?.id),
      Number(req.params.workspace_id) || 0,
      req.method
    );
    return true;
  }
}
