import { Test, TestingModule } from '@nestjs/testing';
import { WorkSpacesController } from './work-spaces.controller';

describe('WorkSpacesController', () => {
  let controller: WorkSpacesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkSpacesController],
    }).compile();

    controller = module.get<WorkSpacesController>(WorkSpacesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
