import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { AuthService } from '../services/auth.service';
import { UnitUserService } from '../services/unit-user.service';
import { UnitCommentService } from '../services/unit-comment.service';
import { WorkspaceUserService } from '../services/workspace-user.service';
import { UnitCommentController } from './unit-comment.controller';

describe('UnitCommentController', () => {
  let controller: UnitCommentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UnitCommentController],
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
          provide: UnitUserService,
          useValue: createMock<UnitUserService>()
        },
        {
          provide: WorkspaceUserService,
          useValue: createMock<WorkspaceUserService>()
        },
        {
          provide: UnitCommentService,
          useValue: createMock<UnitCommentService>()
        }
      ]
    }).compile();

    controller = module.get<UnitCommentController>(UnitCommentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
