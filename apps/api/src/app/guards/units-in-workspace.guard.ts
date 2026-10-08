import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { UnitService } from '../services/unit.service';
import { UnitIdsInWorkspaceGuard } from './unit-ids-in-workspace.guard';
import { unitIdsOfList } from '../utils/unit-ids';

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
 * path names the target, and {@link CopySourcesAccessibleGuard} asks about its units (#1779).
 */
@Injectable()
export class UnitsInWorkspaceGuard extends UnitIdsInWorkspaceGuard {
  constructor(unitService: UnitService) {
    super(unitService, (req: Request) => unitIdsOfList(req.body?.ids));
  }
}
