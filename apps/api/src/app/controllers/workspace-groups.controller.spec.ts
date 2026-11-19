import { Test, TestingModule } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { WorkspaceGroupsController } from './workspace-groups.controller';
import { WorkspaceGroupService } from '../services/workspace-group.service';
import { WorkspaceService } from '../services/workspace.service';
import { UnitService } from '../services/unit.service';
import { UsersService } from '../services/users.service';
import { WorkspaceReportClass } from '../classes/workspace-report.class';
import { IsAdminGuard } from '../guards/is-admin.guard';
import { AuthService } from '../services/auth.service';
import { UnitItemService } from '../services/unit-item.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

describe('WorkspaceGroupsController', () => {
  let controller: WorkspaceGroupsController;
  let workspaceGroupService: DeepMocked<WorkspaceGroupService>;
  let workspaceService: DeepMocked<WorkspaceService>;
  let unitService: DeepMocked<UnitService>;
  let usersService: DeepMocked<UsersService>;

  beforeEach(async () => {
    workspaceGroupService = createMock<WorkspaceGroupService>();
    workspaceService = createMock<WorkspaceService>();
    unitService = createMock<UnitService>();
    usersService = createMock<UsersService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkspaceGroupsController],
      providers: [
        { provide: WorkspaceGroupService, useValue: workspaceGroupService },
        { provide: WorkspaceService, useValue: workspaceService },
        { provide: UnitService, useValue: unitService },
        { provide: UsersService, useValue: usersService },
        { provide: IsAdminGuard, useValue: { canActivate: jest.fn(() => true) } },
        { provide: AuthService, useValue: createMock<AuthService>() },
        { provide: UnitItemService, useValue: createMock<UnitItemService>() }
      ]
    }).compile();

    controller = module.get<WorkspaceGroupsController>(WorkspaceGroupsController);
  });

  // The guards are the authorisation of each method; no other unit test sees them (#1953).
  it.each(['findAll', 'findReport', 'remove', 'create'] as const)(
    'should let only administrators reach %s',
    method => {
      expect(Reflect.getMetadata('__guards__', WorkspaceGroupsController.prototype[method]))
        .toEqual([JwtAuthGuard, IsAdminGuard]);
    }
  );

  // The group id 0 stands for every group (#2181).
  it('should report over the workspaces of every group', async () => {
    jest.spyOn(WorkspaceReportClass, 'build').mockResolvedValue([]);

    expect(await controller.findReport()).toEqual([]);
    expect(WorkspaceReportClass.build).toHaveBeenCalledWith(workspaceService, unitService, 0);
  });
});
