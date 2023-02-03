import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { AppController } from './app.controller';
import { AuthService } from './auth/service/auth.service';
import { UsersService } from './database/services/users.service';
import { WorkspaceService } from './database/services/workspace.service';
import { ReviewService } from './database/services/review.service';
import { VeronaModulesService } from './database/services/verona-modules.service';

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
