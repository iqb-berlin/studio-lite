import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException, ConflictException, UnprocessableEntityException
} from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
// `unstable_mockModule` is missing from the global `jest` object's type, so it comes from here.
// It is aliased because the global `jest` -- used for `jest.fn()` below -- types its mocks
// loosely, and importing over that name would make every `mockReturnValue` a type error.
import { jest as jestEsm } from '@jest/globals';
import 'multer';
// The class itself arrives through the dynamic import below; this keeps its name usable as a
// type, which a `const` from `await import()` cannot be.
import type { ResourcePackageService } from './resource-package.service';
import ResourcePackage from '../entities/resource-package.entity';
import { ResourcePackageNotFoundException } from '../exceptions/resource-package-not-found.exception';

// ESM module namespaces are frozen, so a replacement has to be registered before the module is
// pulled in -- which is why the imports below are dynamic. ES modules have no automock, so the
// rest of fs is carried over unchanged rather than left undefined: anything this suite does not
// control itself would otherwise fail with "is not a function".
jestEsm.unstable_mockModule('fs', () => ({
  ...(jest.requireActual('fs') as object),
  existsSync: jest.fn(),
  rmSync: jest.fn(),
  writeFileSync: jest.fn(),
  readFileSync: jest.fn(),
  mkdirSync: jest.fn()
}));

jestEsm.unstable_mockModule('adm-zip', () => ({
  default: jest.fn()
}));

const fs = await import('fs');
const AdmZipMock = (await import('adm-zip')).default as unknown as jest.Mock;
const { ResourcePackageService: ResourcePackageServiceClass } = await import('./resource-package.service');

describe('ResourcePackageService', () => {
  let service: ResourcePackageService;
  let resourcePackageRepository: DeepMocked<Repository<ResourcePackage>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResourcePackageServiceClass,
        {
          provide: getRepositoryToken(ResourcePackage),
          useValue: createMock<Repository<ResourcePackage>>()
        }
      ]
    }).compile();

    service = module.get<ResourcePackageService>(ResourcePackageServiceClass);
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

      AdmZipMock.mockImplementation(() => ({
        getEntries: jest.fn().mockReturnValue([{ entryName: 'file1' }]),
        extractAllToAsync: mockExtractAllToAsync
      }));

      await service.create(file);

      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(resourcePackageRepository.save).toHaveBeenCalled();
    });

    it('should throw a conflict if package already exists', async () => {
      const file = {
        originalname: 'test.itcr.zip',
        buffer: Buffer.from('')
      } as Express.Multer.File;
      resourcePackageRepository.findOne.mockResolvedValue(new ResourcePackage());
      AdmZipMock.mockImplementation(() => ({}));

      await expect(service.create(file)).rejects.toThrow(ConflictException);
    });

    it('should throw a bad request if file is not valid resource package', async () => {
      const file = {
        originalname: 'invalid.zip',
        buffer: Buffer.from('')
      } as Express.Multer.File;
      AdmZipMock.mockImplementation(() => ({}));

      await expect(service.create(file)).rejects.toThrow(BadRequestException);
    });

    it('should throw an unprocessable entity if the file is not a readable zip', async () => {
      const file = {
        originalname: 'broken.itcr.zip',
        buffer: Buffer.from('not a zip')
      } as Express.Multer.File;
      resourcePackageRepository.findOne.mockResolvedValue(null);
      AdmZipMock.mockImplementation(() => {
        throw new Error('Invalid or unsupported zip format. No END header found');
      });

      await expect(service.create(file)).rejects.toThrow(UnprocessableEntityException);
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
