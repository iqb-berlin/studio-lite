import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import 'multer';
import * as fs from 'fs';
import * as AdmZip from 'adm-zip';
import { ResourcePackageService } from './resource-package.service';
import ResourcePackage from '../entities/resource-package.entity';
import { ResourcePackageNotFoundException } from '../exceptions/resource-package-not-found.exception';

jest.mock('fs');
jest.mock('adm-zip');

describe('ResourcePackageService', () => {
  let service: ResourcePackageService;
  let resourcePackageRepository: DeepMocked<Repository<ResourcePackage>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResourcePackageService,
        {
          provide: getRepositoryToken(ResourcePackage),
          useValue: createMock<Repository<ResourcePackage>>()
        }
      ]
    }).compile();

    service = module.get<ResourcePackageService>(ResourcePackageService);
    resourcePackageRepository = module.get(getRepositoryToken(ResourcePackage));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findResourcePackages', () => {
    it('should return packages', async () => {
      const result = [new ResourcePackage()];
      resourcePackageRepository.find.mockResolvedValue(result);
      expect(await service.findResourcePackages()).toBe(result);
    });
  });

  describe('removeResourcePackages', () => {
    it('should remove multiple packages', async () => {
      const spy = jest.spyOn(service, 'removeResourcePackage').mockResolvedValue(undefined);
      await service.removeResourcePackages([1, 2]);
      expect(spy).toHaveBeenCalledTimes(2);
    });
  });

  describe('removeResourcePackage', () => {
    it('should throw if not found', async () => {
      resourcePackageRepository.findOne.mockResolvedValue(null);
      await expect(service.removeResourcePackage(1)).rejects.toThrow(ResourcePackageNotFoundException);
    });

    it('should remove package and files', async () => {
      const resourcePackage = new ResourcePackage();
      resourcePackage.name = 'pkg';
      resourcePackageRepository.findOne.mockResolvedValue(resourcePackage);
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      await service.removeResourcePackage(1);

      expect(fs.rmSync).toHaveBeenCalled();
      expect(resourcePackageRepository.delete).toHaveBeenCalledWith(resourcePackage);
    });
  });

  describe('create', () => {
    it('should create valid package', async () => {
      const file = {
        originalname: 'test.itcr.zip',
        buffer: Buffer.from('')
      } as Express.Multer.File;

      resourcePackageRepository.findOne.mockResolvedValue(null);
      resourcePackageRepository.create.mockReturnValue(new ResourcePackage());
      resourcePackageRepository.save.mockResolvedValue(new ResourcePackage());

      const mockExtractAllToAsync = jest.fn((target, overwrite, keepOriginal, callback) => {
        // Handle optional argument logic roughly
        if (typeof keepOriginal === 'function') {
          keepOriginal(null);
        } else {
          callback(null);
        }
      });

      (AdmZip as unknown as jest.Mock).mockImplementation(() => ({
        getEntries: jest.fn().mockReturnValue([{ entryName: 'file1' }]),
        extractAllToAsync: mockExtractAllToAsync
      }));

      await service.create(file);

      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(resourcePackageRepository.save).toHaveBeenCalled();
    });

    it('should throw if package already exists', async () => {
      const file = {
        originalname: 'test.itcr.zip',
        buffer: Buffer.from('')
      } as Express.Multer.File;
      resourcePackageRepository.findOne.mockResolvedValue(new ResourcePackage());
      (AdmZip as unknown as jest.Mock).mockImplementation(() => ({}));

      await expect(service.create(file)).rejects.toThrow('Package is already installed');
    });

    it('should throw if file is not valid resource package', async () => {
      const file = {
        originalname: 'invalid.zip',
        buffer: Buffer.from('')
      } as Express.Multer.File;
      (AdmZip as unknown as jest.Mock).mockImplementation(() => ({}));
      await expect(service.create(file)).rejects.toThrow('No Resource Package');
    });
  });

  describe('getZippedResourcePackage', () => {
    it('should return buffer', () => {
      (fs.readFileSync as jest.Mock).mockReturnValue(Buffer.from('content'));
      const result = service.getZippedResourcePackage('pkg');
      expect(result).toBeInstanceOf(Buffer);
    });
  });
});
