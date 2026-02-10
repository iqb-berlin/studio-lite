import { Express } from 'express';
import { Test, TestingModule } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { AdminResourcePackageController } from './admin-resource-package.controller';
import { ResourcePackageService } from '../services/resource-package.service';
import { IsAdminGuard } from '../guards/is-admin.guard';
import { AuthService } from '../services/auth.service';

describe('AdminResourcePackageController', () => {
  let controller: AdminResourcePackageController;
  let resourcePackageService: DeepMocked<ResourcePackageService>;

  beforeEach(async () => {
    resourcePackageService = createMock<ResourcePackageService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminResourcePackageController],
      providers: [
        { provide: ResourcePackageService, useValue: resourcePackageService },
        { provide: IsAdminGuard, useValue: { canActivate: jest.fn(() => true) } },
        { provide: AuthService, useValue: createMock<AuthService>() }
      ]
    }).compile();

    controller = module.get<AdminResourcePackageController>(
      AdminResourcePackageController
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('removeIds', () => {
    it('should call service removeResourcePackages', async () => {
      const ids = [1, 2];
      resourcePackageService.removeResourcePackages.mockResolvedValue(undefined);

      await controller.removeIds(ids);

      expect(resourcePackageService.removeResourcePackages).toHaveBeenCalledWith(ids);
    });
  });

  describe('create', () => {
    it('should call service create and return the new id', async () => {
      const mockFile = { originalname: 'test.zip' } as Express.Multer.File;
      resourcePackageService.create.mockResolvedValue(123);

      const result = await controller.create(mockFile);

      expect(result).toBe(123);
      expect(resourcePackageService.create).toHaveBeenCalledWith(mockFile);
    });
  });
});
