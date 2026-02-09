import { Test, TestingModule } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { WorkspaceFullDto, UnitInViewDto } from '@studio-lite-lib/api-dto';
import { AdminController } from './admin.controller';
import { WorkspaceService } from '../services/workspace.service';
import { UnitService } from '../services/unit.service';
import { IsAdminGuard } from '../guards/is-admin.guard';
import { AuthService } from '../services/auth.service';

describe('AdminController', () => {
  let controller: AdminController;
  let workspaceService: DeepMocked<WorkspaceService>;
  let unitService: DeepMocked<UnitService>;

  beforeEach(async () => {
    workspaceService = createMock<WorkspaceService>();
    unitService = createMock<UnitService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        { provide: WorkspaceService, useValue: workspaceService },
        { provide: UnitService, useValue: unitService },
        { provide: IsAdminGuard, useValue: { canActivate: jest.fn(() => true) } },
        { provide: AuthService, useValue: createMock<AuthService>() }
      ]
    }).compile();

    controller = module.get<AdminController>(AdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllWorkspaces', () => {
    it('should return all workspaces', async () => {
      const mockWorkspaces = [{ id: 1, name: 'WS' } as WorkspaceFullDto];
      workspaceService.getAllWorkspaces.mockResolvedValue(mockWorkspaces);

      const result = await controller.getAllWorkspaces();

      expect(result).toBe(mockWorkspaces);
      expect(workspaceService.getAllWorkspaces).toHaveBeenCalled();
    });
  });

  describe('getAllUnits', () => {
    it('should return all units', async () => {
      const mockUnits = [{
        id: 1, name: 'Unit', key: 'K1', workspaceId: 1
      } as unknown as UnitInViewDto];
      unitService.getAllUnits.mockResolvedValue(mockUnits);

      const result = await controller.getAllUnits();

      expect(result).toBe(mockUnits);
      expect(unitService.getAllUnits).toHaveBeenCalled();
    });
  });
});
