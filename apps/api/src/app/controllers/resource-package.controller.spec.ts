import { ResourcePackageDto } from '@studio-lite-lib/api-dto';
import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { ResourcePackageController } from './resource-package.controller';
import { ResourcePackageService } from '../services/resource-package.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

describe('ResourcePackageController', () => {
  let controller: ResourcePackageController;
  let resourcePackageService: ResourcePackageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResourcePackageController],
      providers: [
        {
          provide: ResourcePackageService,
          useValue: createMock<ResourcePackageService>()
        }
      ]
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ResourcePackageController>(ResourcePackageController);
    resourcePackageService = module.get<ResourcePackageService>(ResourcePackageService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findResourcePackages', () => {
    it('should return an array of resource packages', async () => {
      const mockResourcePackages: ResourcePackageDto[] = [
        {
          id: 1,
          name: 'Test Package 1',
          elements: ['el1'],
          version: '1.0.0'
        } as ResourcePackageDto,
        {
          id: 2,
          name: 'Test Package 2',
          elements: ['el2'],
          version: '2.0.0'
        } as ResourcePackageDto
      ];

      jest.spyOn(resourcePackageService, 'findResourcePackages')
        .mockResolvedValue(mockResourcePackages);

      const result = await controller.findResourcePackages();

      expect(result).toEqual(mockResourcePackages);
      expect(resourcePackageService.findResourcePackages).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array when no packages exist', async () => {
      jest.spyOn(resourcePackageService, 'findResourcePackages')
        .mockResolvedValue([]);

      const result = await controller.findResourcePackages();

      expect(result).toEqual([]);
      expect(resourcePackageService.findResourcePackages).toHaveBeenCalledTimes(1);
    });
  });
});
