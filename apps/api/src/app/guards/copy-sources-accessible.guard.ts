import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { UnitService } from '../services/unit.service';
import { AuthService } from '../services/auth.service';
import { UnitNotFoundException } from '../exceptions/unit-not-found.exception';
import { sourceUnitIdsOf } from '../utils/unit-request-body';

/**
 * Copying units and creating one from an existing unit take their content from units of another
 * workspace: the path names the target. The caller has to be able to enter the workspace of every
 * one of these units -- by the rule of {@link WorkspaceGuard} -- or the copy would read what they
 * cannot see (#1779). A unit that does not exist, or lies where the caller cannot go, is answered
 * with a 404 for the first of them, and nothing is created.
 *
 * A unit created empty names no source and passes.
 */
@Injectable()
export class CopySourcesAccessibleGuard implements CanActivate {
  constructor(
    private unitService: UnitService,
    private authService: AuthService
  ) {}

  /** Passes when the caller may enter the workspace of every unit the body takes content from. */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request & { user: { id: number } }>();
    const workspaceId = Number(req.params.workspace_id) || 0;
    const unitIds = sourceUnitIdsOf(req.body);
    if (unitIds.length === 0) return true;
    if (unitIds.some(id => !id)) throw new UnitNotFoundException(0, workspaceId, req.method);
    const workspaceOf = await this.unitService.workspacesOfUnits(unitIds);
    const accessible = new Set<number>();
    await Promise.all([...new Set(workspaceOf.values())].map(async id => {
      if (await this.authService.canAccessWorkSpace(req.user.id, id)) accessible.add(id);
    }));
    const hidden = unitIds.find(id => !accessible.has(workspaceOf.get(id)));
    if (hidden) throw new UnitNotFoundException(hidden, workspaceId, req.method);
    return true;
  }
}
