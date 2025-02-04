import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { WorkspaceUnitController } from './workspace-unit-controller';
import { AuthService } from '../services/auth.service';
import { UnitService } from '../services/unit.service';
import { WorkspaceUserService } from '../services/workspace-user.service';

describe('WorkspaceUnitController', () => {
  let controller: WorkspaceUnitController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkspaceUnitController],
      providers: [
        {
          provide: 'APP_VERSION',
          useValue: '0.0.0'
        },
        {
          provide: AuthService,
          useValue: createMock<AuthService>()
        },
        {
          provide: UnitService,
          useValue: createMock<UnitService>()
        },
        {
          provide: WorkspaceUserService,
          useValue: createMock<WorkspaceUserService>()
        }
      ]
    }).compile();

    controller = module.get<WorkspaceUnitController>(WorkspaceUnitController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
