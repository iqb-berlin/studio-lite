import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { UnitService } from '../services/unit.service';
import { UnitNotFoundException } from '../exceptions/unit-not-found.exception';

/**
 * A guard that holds a list of units of a request to the workspace of the path (#1775): every one
 * of them has to be in it. Otherwise the request is answered with a 404 for the first unit that is
 * not, and nothing of it is carried out -- not the units that would have been fine either. A
 * malformed id (0, see unitIdOf) is refused without asking the database.
 *
 * Where the units are named is up to the subclass -- {@link UnitsInWorkspaceGuard} reads the body,
 * {@link QueryUnitsInWorkspaceGuard} the query --, so the two cannot come to answer the question
 * itself differently.
 */
export abstract class UnitIdsInWorkspaceGuard implements CanActivate {
  /** @param unitIdsOf The units the route acts on, a malformed id as 0. */
  protected constructor(
    private unitService: UnitService,
    private unitIdsOf: (req: Request) => number[]
  ) {}

  /** Passes when every unit of the request is in the workspace in the route. */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const workspaceId = Number(req.params.workspace_id) || 0;
    const unitIds = this.unitIdsOf(req);
    if (unitIds.some(id => !id)) throw new UnitNotFoundException(0, workspaceId, req.method);
    const foreignIds = await this.unitService.idsNotInWorkspace(unitIds, workspaceId);
    if (foreignIds.length > 0) throw new UnitNotFoundException(foreignIds[0], workspaceId, req.method);
    return true;
  }
}
