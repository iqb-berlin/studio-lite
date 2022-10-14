import { Test, TestingModule } from '@nestjs/testing';
import { WorkspaceGroupService } from './workspace-group.service';

describe('WorkspaceGroupService', () => {
  let service: WorkspaceGroupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkspaceGroupService]
    }).compile();

    service = module.get<WorkspaceGroupService>(WorkspaceGroupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
