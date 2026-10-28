import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { UnitItemDto, UnitItemWithMetadataDto } from '@studio-lite-lib/api-dto';
import { WorkspaceUnitItemController } from './workspace-unit-item.controller';
import { UnitItemService } from '../services/unit-item.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { WorkspaceGuard } from '../guards/workspace.guard';
import { AppVersionGuard } from '../guards/app-version.guard';
import { WriteAccessGuard } from '../guards/write-access.guard';
import { WorkspaceAccessGuard } from '../guards/workspace-access.guard';
import { WriteOrGroupAdminAccessGuard } from '../guards/write-or-group-admin-access.guard';
import { AuthService } from '../services/auth.service';
import { WorkspaceService } from '../services/workspace.service';
import { WorkspaceUserService } from '../services/workspace-user.service';
import { UnitInWorkspaceGuard } from '../guards/unit-in-workspace.guard';
import { ItemInUnitGuard } from '../guards/item-in-unit.guard';

describe('WorkspaceUnitItemController', () => {
  let controller: WorkspaceUnitItemController;
  let unitItemService: UnitItemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkspaceUnitItemController],
      providers: [
        { provide: UnitItemService, useValue: createMock<UnitItemService>() },
        { provide: AuthService, useValue: createMock<AuthService>() },
        { provide: WorkspaceService, useValue: createMock<WorkspaceService>() },
        { provide: WorkspaceUserService, useValue: createMock<WorkspaceUserService>() },
        WriteOrGroupAdminAccessGuard
      ]
    })
      .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
      .overrideGuard(WorkspaceGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(AppVersionGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(WriteAccessGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(WorkspaceAccessGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(WriteOrGroupAdminAccessGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(UnitInWorkspaceGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<WorkspaceUnitItemController>(WorkspaceUnitItemController);
    unitItemService = module.get<UnitItemService>(UnitItemService);
  });

  // The access guards ask about the workspace in the path alone (#1775).
  it.each(['findAll', 'create', 'remove', 'findItemCommentsByUnitId'] as const)(
    'should hold the unit of %s to the workspace in its path',
    method => {
      // Right after the workspace -- or after the app version, which is checked first as the cheaper.
      const guards = Reflect.getMetadata('__guards__', WorkspaceUnitItemController.prototype[method]);
      expect(guards.slice(0, 2)).toEqual([JwtAuthGuard, WorkspaceGuard]);
      expect(guards.slice(2).filter(guard => guard !== AppVersionGuard)[0]).toBe(UnitInWorkspaceGuard);
    }
  );

  // The item of the path is held to the unit last, after the access is known (#1778).
  it('should hold the item that remove deletes to the unit in its path', () => {
    expect(Reflect.getMetadata('__guards__', WorkspaceUnitItemController.prototype.remove)).toEqual([
      JwtAuthGuard, WorkspaceGuard, UnitInWorkspaceGuard, WriteOrGroupAdminAccessGuard, ItemInUnitGuard
    ]);
  });

  describe('findAll', () => {
    it('should return unit items without metadata', async () => {
      const result: UnitItemDto[] = [];
      jest.spyOn(unitItemService, 'getAllByUnitId').mockResolvedValue(result);

      expect(await controller.findAll(1, true)).toBe(result);
      expect(unitItemService.getAllByUnitId).toHaveBeenCalledWith(1);
    });

    it('should return unit items with metadata', async () => {
      const result: UnitItemWithMetadataDto[] = [];
      jest.spyOn(unitItemService, 'getAllByUnitIdWithMetadata').mockResolvedValue(result);

      expect(await controller.findAll(1, false)).toBe(result);
      expect(unitItemService.getAllByUnitIdWithMetadata).toHaveBeenCalledWith(1);
    });
  });
});
