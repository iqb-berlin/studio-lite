import { Test, TestingModule } from '@nestjs/testing';
import { WorkspaceGroupsController } from './workspace-groups.controller';

describe('WorkspaceGroupsController', () => {
  let controller: WorkspaceGroupsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkspaceGroupsController],
    }).compile();

    controller = module.get<WorkspaceGroupsController>(WorkspaceGroupsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
