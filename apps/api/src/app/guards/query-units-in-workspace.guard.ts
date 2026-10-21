import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { UnitService } from '../services/unit.service';
import { UnitIdsInWorkspaceGuard } from './unit-ids-in-workspace.guard';
import { unitIdsOfQuery } from '../utils/unit-ids';

/**
 * {@link UnitsInWorkspaceGuard} for a route that takes its units from the comma-separated `id` of
 * the query -- deleting units. Every one of them has to be in the workspace of the path (#1775),
 * otherwise the request is answered with a 404 and nothing is deleted.
 *
 * It reads the query alone, as the route does: a body sent along is not what gets deleted.
 */
@Injectable()
export class QueryUnitsInWorkspaceGuard extends UnitIdsInWorkspaceGuard {
  constructor(unitService: UnitService) {
    super(unitService, (req: Request) => unitIdsOfQuery(req.query?.id));
  }
}
