import { Test, TestingModule } from '@nestjs/testing';
import { WorkspaceUserService } from './workspace-user.service';

describe('WorkspaceUserService', () => {
  let service: WorkspaceUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkspaceUserService],
    }).compile();

    service = module.get<WorkspaceUserService>(WorkspaceUserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
