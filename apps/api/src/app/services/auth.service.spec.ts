import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { WorkspaceService } from './workspace.service';
import { ReviewService } from './review.service';
import { WorkspaceGroupService } from './workspace-group.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
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
          provide: WorkspaceGroupService,
          useValue: createMock<WorkspaceGroupService>()
        },
        {
          provide: JwtService,
          useValue: createMock<JwtService>()
        }
      ]
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
