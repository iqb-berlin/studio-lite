import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { AdminResourcePackageController } from './admin-resource-package.controller';
import { AuthService } from '../services/auth.service';
import { ResourcePackageService } from '../services/resource-package.service';

describe('ResourcePackageController', () => {
  let controller: AdminResourcePackageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminResourcePackageController],
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

    controller = module.get<AdminResourcePackageController>(
      AdminResourcePackageController
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
