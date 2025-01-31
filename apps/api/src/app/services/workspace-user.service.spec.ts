import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { createMock } from '@golevelup/ts-jest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WorkspaceUserService } from './workspace-user.service';
import { UnitUserService } from './unit-user.service';
import Workspace from '../entities/workspace.entity';
import WorkspaceUser from '../entities/workspace-user.entity';

describe('WorkspaceUserService', () => {
  let service: WorkspaceUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceUserService,
        {
          provide: UnitUserService,
          useValue: createMock<UnitUserService>()
        },
        {
          provide: getRepositoryToken(Workspace),
          useValue: createMock<Repository<Workspace>>()
        },
        {
          provide: getRepositoryToken(WorkspaceUser),
          useValue: createMock<Repository<WorkspaceUser>>()
        }
      ]
    }).compile();

    service = module.get<WorkspaceUserService>(WorkspaceUserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
