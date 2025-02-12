import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { AppController } from './app.controller';
import { AuthService } from '../services/auth.service';
import { UsersService } from '../services/users.service';
import { WorkspaceService } from '../services/workspace.service';
import { ReviewService } from '../services/review.service';
import { VeronaModulesService } from '../services/verona-modules.service';
import { UnitService } from '../services/unit.service';

describe('AppController', () => {
  let controller: AppController;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
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
          provide: UsersService,
          useValue: createMock<UsersService>()
        },
        {
          provide: WorkspaceService,
          useValue: createMock<WorkspaceService>()
        },
        {
          provide: ReviewService,
          useValue: createMock<ReviewService>()
        },
        {
          provide: VeronaModulesService,
          useValue: createMock<VeronaModulesService>()
        }
      ]
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  it('should be defined"', () => {
    expect(controller).toBeDefined();
  });
});
