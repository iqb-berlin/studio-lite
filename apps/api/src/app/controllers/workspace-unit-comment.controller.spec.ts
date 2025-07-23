import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { AuthService } from '../services/auth.service';
import { UnitUserService } from '../services/unit-user.service';
import { UnitCommentService } from '../services/unit-comment.service';
import { WorkspaceUserService } from '../services/workspace-user.service';
import { WorkspaceUnitCommentController } from './workspace-unit-comment.controller';
import { ItemCommentService } from '../services/item-comment.service';

describe('WorkspaceUnitCommentController', () => {
  let controller: WorkspaceUnitCommentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkspaceUnitCommentController],
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
        },
        {
          provide: ItemCommentService,
          useValue: createMock<ItemCommentService>()
        }
      ]
    }).compile();

    controller = module.get<WorkspaceUnitCommentController>(WorkspaceUnitCommentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
