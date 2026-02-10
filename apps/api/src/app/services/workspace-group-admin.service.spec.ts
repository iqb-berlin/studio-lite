import { Test, TestingModule } from '@nestjs/testing';
import { WorkspaceGroupAdminService } from './workspace-group-admin.service';

describe('WorkspaceGroupAdminService', () => {
  let service: WorkspaceGroupAdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkspaceGroupAdminService]
    }).compile();

    service = module.get<WorkspaceGroupAdminService>(WorkspaceGroupAdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
