import { Test, TestingModule } from '@nestjs/testing';
import { ResourcePackageController } from './resource-package.controller';

describe('ResourcePackageController', () => {
  let controller: ResourcePackageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResourcePackageController]
    }).compile();

    controller = module.get<ResourcePackageController>(
      ResourcePackageController
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
