import { UnitItemMetadataController } from './unit-item-metadata.controller';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { WorkspaceGuard } from '../guards/workspace.guard';
import { AppVersionGuard } from '../guards/app-version.guard';
import { WriteAccessGuard } from '../guards/write-access.guard';
import { WorkspaceAccessGuard } from '../guards/workspace-access.guard';
import { UnitInWorkspaceGuard } from '../guards/unit-in-workspace.guard';
import { ItemInUnitGuard } from '../guards/item-in-unit.guard';
import { ItemMetadataInItemGuard } from '../guards/item-metadata-in-item.guard';

describe('UnitItemMetadataController', () => {
  // The access guards ask about the workspace in the path alone (#1775).
  it.each(['findAll', 'create', 'remove'] as const)(
    'should hold the unit of %s to the workspace in its path',
    method => {
      // Right after the workspace -- or after the app version, which is checked first as the cheaper.
      const guards = Reflect.getMetadata('__guards__', UnitItemMetadataController.prototype[method]);
      expect(guards.slice(0, 2)).toEqual([JwtAuthGuard, WorkspaceGuard]);
      expect(guards.slice(2).filter(guard => guard !== AppVersionGuard)[0]).toBe(UnitInWorkspaceGuard);
    }
  );

  // The item of the path is held to the unit, and the row to the item, after the access is known (#1778).
  it.each([
    ['findAll', [
      JwtAuthGuard, WorkspaceGuard, AppVersionGuard, UnitInWorkspaceGuard, WorkspaceAccessGuard, ItemInUnitGuard
    ]],
    ['create', [JwtAuthGuard, WorkspaceGuard, UnitInWorkspaceGuard, WriteAccessGuard, ItemInUnitGuard]],
    ['remove', [
      JwtAuthGuard, WorkspaceGuard, UnitInWorkspaceGuard, WriteAccessGuard, ItemInUnitGuard, ItemMetadataInItemGuard
    ]]
  ] as const)('should hold %s to the item in its path', (method, expected) => {
    expect(Reflect.getMetadata('__guards__', UnitItemMetadataController.prototype[method])).toEqual(expected);
  });
});
