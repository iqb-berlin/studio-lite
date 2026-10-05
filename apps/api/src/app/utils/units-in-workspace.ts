import { UnitService } from '../services/unit.service';
import { UnitNotFoundException } from '../exceptions/unit-not-found.exception';

/**
 * Refuses a request unless every one of its units is in the workspace of the path (#1775). Both
 * {@link UnitsInWorkspaceGuard} and {@link QueryUnitsInWorkspaceGuard} ask it, each with the units
 * of the part of the request its routes act on -- so the two cannot come to answer it differently.
 *
 * A malformed id (0, see unitIdOf) is refused without asking the database. Otherwise the request
 * is answered with a 404 for the first unit that is not in the workspace.
 */
export async function assertUnitsInWorkspace(
  unitService: UnitService,
  unitIds: number[],
  workspaceId: number,
  method: string
): Promise<void> {
  if (unitIds.some(id => !id)) throw new UnitNotFoundException(0, workspaceId, method);
  const foreignIds = await unitService.idsNotInWorkspace(unitIds, workspaceId);
  if (foreignIds.length > 0) throw new UnitNotFoundException(foreignIds[0], workspaceId, method);
}
