import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createMock } from '@golevelup/ts-jest';
import { Repository } from 'typeorm';
import Workspace from '../entities/workspace.entity';
import { UsersService } from './users.service';
import WorkspaceUser from '../entities/workspace-user.entity';
import WorkspaceGroupAdmin from '../entities/workspace-group-admin.entity';
import User from '../entities/user.entity';
import Review from '../entities/review.entity';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(Workspace),
          useValue: createMock<Repository<Workspace>>()
        },
        {
          provide: getRepositoryToken(WorkspaceGroupAdmin),
          useValue: createMock<Repository<WorkspaceGroupAdmin>>()
        },
        {
          provide: getRepositoryToken(WorkspaceUser),
          useValue: createMock<Repository<WorkspaceUser>>()
        },
        {
          provide: getRepositoryToken(User),
          useValue: createMock<Repository<User>>()
        },
        {
          provide: getRepositoryToken(Review),
          useValue: createMock<Repository<Review>>()
        }
      ]
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
