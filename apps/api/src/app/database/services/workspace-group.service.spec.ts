import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createMock } from '@golevelup/ts-jest';
import { Repository } from 'typeorm';
import WorkspaceGroupAdmin from '../entities/workspace-group-admin.entity';
import { WorkspaceGroupService } from './workspace-group.service';
import WorkspaceGroup from '../entities/workspace-group.entity';

describe('WorkspaceGroupService', () => {
  let service: WorkspaceGroupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceGroupService,
        {
          provide: getRepositoryToken(WorkspaceGroup),
          useValue: createMock<Repository<WorkspaceGroup>>()
        },
        {
          provide: getRepositoryToken(WorkspaceGroupAdmin),
          useValue: createMock<Repository<WorkspaceGroupAdmin>>()
        }
      ]
    }).compile();

    service = module.get<WorkspaceGroupService>(WorkspaceGroupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
