import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { createMock } from '@golevelup/ts-jest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WorkspaceService } from './workspace.service';
import Unit from '../entities/unit.entity';
import { WorkspaceUserService } from './workspace-user.service';
import { UsersService } from './users.service';
import { UnitService } from './unit.service';
import { UnitUserService } from './unit-user.service';
import Workspace from '../entities/workspace.entity';
import WorkspaceUser from '../entities/workspace-user.entity';
import WorkspaceGroup from '../entities/workspace-group.entity';
import WorkspaceGroupAdmin from '../entities/workspace-group-admin.entity';
import { UnitCommentService } from './unit-comment.service';

describe('WorkspaceService', () => {
  let service: WorkspaceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceService,
        {
          provide: WorkspaceUserService,
          useValue: createMock<WorkspaceUserService>()
        },
        {
          provide: UsersService,
          useValue: createMock<UsersService>()
        },
        {
          provide: UnitService,
          useValue: createMock<UnitService>()
        },
        {
          provide: UnitUserService,
          useValue: createMock<UnitUserService>()
        },
        {
          provide: UnitCommentService,
          useValue: createMock<UnitUserService>()
        },
        {
          provide: getRepositoryToken(Workspace),
          useValue: createMock<Repository<Workspace>>()
        },
        {
          provide: getRepositoryToken(WorkspaceUser),
          useValue: createMock<Repository<WorkspaceUser>>()
        },
        {
          provide: getRepositoryToken(WorkspaceGroup),
          useValue: createMock<Repository<WorkspaceGroup>>()
        },
        {
          provide: getRepositoryToken(WorkspaceGroupAdmin),
          useValue: createMock<Repository<WorkspaceGroupAdmin>>()
        },
        {
          provide: getRepositoryToken(Unit),
          useValue: createMock<Repository<Unit>>()
        }
      ]
    }).compile();
    service = module.get<WorkspaceService>(WorkspaceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
