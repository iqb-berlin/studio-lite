import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { ResourcePackageController } from './resource-package.controller';
import { AuthService } from '../services/auth.service';
import { ResourcePackageService } from '../services/resource-package.service';

describe('ResourcePackageController', () => {
  let controller: ResourcePackageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResourcePackageController],
      providers: [
        {
          provide: AuthService,
          useValue: createMock<AuthService>()
        },
        {
          provide: ResourcePackageService,
          useValue: createMock<ResourcePackageService>()
        }
      ]
    }).compile();

    controller = module.get<ResourcePackageController>(
      ResourcePackageController
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
