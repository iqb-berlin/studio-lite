import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException, ConflictException, InternalServerErrorException, UnprocessableEntityException
} from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
// `unstable_mockModule` is missing from the global `jest` object's type, so it comes from here.
// It is aliased because the global `jest` -- used for `jest.fn()` below -- types its mocks
// loosely, and importing over that name would make every `mockReturnValue` a type error.
import { jest as jestEsm } from '@jest/globals';
import 'multer';
import * as path from 'path';
// The class itself arrives through the dynamic import below; this keeps its name usable as a
// type, which a `const` from `await import()` cannot be.
import type { ResourcePackageService } from './resource-package.service';
import ResourcePackage from '../entities/resource-package.entity';
import Workspace from '../entities/workspace.entity';
import WorkspaceGroup from '../entities/workspace-group.entity';
import { SettingService } from './setting.service';
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
  renameSync: jest.fn(),
  mkdirSync: jest.fn()
}));

jestEsm.unstable_mockModule('adm-zip', () => ({
  default: jest.fn()
}));

const fs = await import('fs');
const AdmZipMock = (await import('adm-zip')).default as unknown as jest.Mock;
const { ResourcePackageService: ResourcePackageServiceClass } = await import('./resource-package.service');

const installedPackage = (id: number, name: string, packageName = 'GeoGebra'): ResourcePackage => {
  const resourcePackage = new ResourcePackage();
  Object.assign(resourcePackage, { id, name, packageName });
  return resourcePackage;
};

describe('ResourcePackageService', () => {
  let service: ResourcePackageService;
  let resourcePackageRepository: DeepMocked<Repository<ResourcePackage>>;
  let workspaceRepository: DeepMocked<Repository<Workspace>>;
  let workspaceGroupRepository: DeepMocked<Repository<WorkspaceGroup>>;
  let settingService: DeepMocked<SettingService>;
  let defaults: Record<string, string>;

  /** Two versions of GeoGebra, 5.0.791 the default, and workspace 7 in a group that chose 5.3. */
  const givenTwoVersions = (groupChoice?: Record<string, string>) => {
    resourcePackageRepository.find.mockResolvedValue([
      installedPackage(1, 'GeoGebra-5.0.791'), installedPackage(2, 'GeoGebra-5.3')
    ]);
    defaults = { GeoGebra: 'GeoGebra-5.0.791' };
    workspaceRepository.findOne.mockResolvedValue(createMock<Workspace>({
      id: 7,
      groupId: 3,
      workspaceGroup: { id: 3, name: 'Group', settings: { chosenResourcePackages: groupChoice } }
    }));
    workspaceGroupRepository.find.mockResolvedValue([
      { id: 3, name: 'Group', settings: { chosenResourcePackages: groupChoice } } as WorkspaceGroup
    ]);
  };

  const zipOf = (entries: string[], extract = (callback: (error: Error | null) => void) => callback(null)) => {
    AdmZipMock.mockImplementation(() => ({
      getEntries: jest.fn().mockReturnValue(entries.map(entryName => ({ entryName }))),
      extractAllToAsync: jest.fn((target, overwrite, keepOriginal, callback) => extract(callback))
    }));
  };

  const upload = (originalname: string) => ({ originalname, buffer: Buffer.from('zip') }) as Express.Multer.File;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResourcePackageServiceClass,
        { provide: getRepositoryToken(ResourcePackage), useValue: createMock<Repository<ResourcePackage>>() },
        { provide: getRepositoryToken(Workspace), useValue: createMock<Repository<Workspace>>() },
        { provide: getRepositoryToken(WorkspaceGroup), useValue: createMock<Repository<WorkspaceGroup>>() },
        { provide: SettingService, useValue: createMock<SettingService>() }
      ]
    }).compile();

    service = module.get<ResourcePackageService>(ResourcePackageServiceClass);
    resourcePackageRepository = module.get(getRepositoryToken(ResourcePackage));
    workspaceRepository = module.get(getRepositoryToken(Workspace));
    workspaceGroupRepository = module.get(getRepositoryToken(WorkspaceGroup));
    settingService = module.get(SettingService);

    jest.clearAllMocks();
    defaults = {};
    settingService.findResourcePackageDefaults.mockImplementation(async () => defaults);
    settingService.patchResourcePackageDefaults.mockImplementation(async newDefaults => {
      defaults = newDefaults;
    });
    workspaceGroupRepository.find.mockResolvedValue([]);
  });

  describe('a package name in a workspace (#1358)', () => {
    it('should serve the package the group of the workspace chose', async () => {
      givenTwoVersions({ GeoGebra: 'GeoGebra-5.3' });

      expect(await service.findPackageFile(7, ['GeoGebra', 'GeoGebra', 'deployggb.js']))
        .toEqual({ root: expect.stringMatching(/\/packages\/GeoGebra-5\.3$/), file: 'GeoGebra/deployggb.js' });
      expect(workspaceRepository.findOne).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 7 } }));
    });

    it('should serve the default to a group that chose nothing, and pass over empty segments', async () => {
      givenTwoVersions();

      expect(await service.findPackageFile(7, ['', 'GeoGebra', 'GeoGebra', 'deployggb.js']))
        .toEqual({ root: expect.stringMatching(/\/packages\/GeoGebra-5\.0\.791$/), file: 'GeoGebra/deployggb.js' });
    });

    it('should serve nothing for an unknown workspace, an unknown name or the folder alone', async () => {
      givenTwoVersions();
      expect(await service.findPackageFile(7, ['avatar', 'avatar.json'])).toBeNull();
      expect(await service.findPackageFile(7, ['GeoGebra'])).toBeNull();
      workspaceRepository.findOne.mockResolvedValue(null);
      expect(await service.findPackageFile(8, ['GeoGebra', 'GeoGebra', 'deployggb.js'])).toBeNull();
    });

    it('should name the package names and the package names a workspace finds served', async () => {
      givenTwoVersions();
      resourcePackageRepository.find.mockResolvedValue([
        installedPackage(1, 'GeoGebra-5.3'), installedPackage(2, 'avatar', 'avatar')
      ]);

      // GeoGebra-5.3 is no default and not installed as GeoGebra: nothing serves GeoGebra, but a module
      // asking for GeoGebra-5.3 by its own name gets it
      expect(await service.findPackageNamesForWorkspace(7)).toEqual(['GeoGebra-5.3', 'avatar']);
    });

    it('should hand out the zip of the serving package under the package name it stands in for', async () => {
      givenTwoVersions({ GeoGebra: 'GeoGebra-5.3' });
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(Buffer.from('zip'));

      // spelt as set, not as a unit happens to spell it: the testcenter unpacks into a folder of that name
      const zipped = await service.findZippedResourcePackage('geogebra.itcr.zip', 7);

      expect(zipped).toEqual({ fileName: 'GeoGebra.itcr.zip', file: Buffer.from('zip') });
      expect(fs.readFileSync).toHaveBeenCalledWith('./packages/GeoGebra-5.3/GeoGebra-5.3.itcr.zip');
    });

    it('should hand out a package asked for by its own name under that name', async () => {
      givenTwoVersions();
      resourcePackageRepository.find.mockResolvedValue([installedPackage(1, 'units-2026', 'units')]);
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(Buffer.from('zip'));

      expect((await service.findZippedResourcePackage('units-2026.itcr.zip', 7))?.fileName)
        .toBe('units-2026.itcr.zip');
    });

    it('should hand out nothing when the zip is not on disk', async () => {
      givenTwoVersions();
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      expect(await service.findZippedResourcePackage('GeoGebra.itcr.zip', 7)).toBeNull();
    });
  });

  describe('setDefaults', () => {
    it('should store each default as installed, under the package name it stands in for', async () => {
      givenTwoVersions();

      await service.setDefaults({ geogebra: 'geogebra-5.3' });

      expect(settingService.patchResourcePackageDefaults).toHaveBeenCalledWith({ GeoGebra: 'GeoGebra-5.3' });
    });

    it('should refuse a default that is no package of its package name', async () => {
      givenTwoVersions();
      resourcePackageRepository.find.mockResolvedValue([
        installedPackage(1, 'GeoGebra-5.3'), installedPackage(2, 'avatar', 'avatar')
      ]);

      await expect(service.setDefaults({ GeoGebra: 'avatar' })).rejects.toThrow(BadRequestException);
      await expect(service.setDefaults({ GeoGebra: 'GeoGebra-6.0' })).rejects.toThrow(BadRequestException);
      await expect(service.setDefaults(['GeoGebra-5.3'])).rejects.toThrow(BadRequestException);
      expect(settingService.patchResourcePackageDefaults).not.toHaveBeenCalled();
    });
  });

  describe('removeResourcePackage', () => {
    it('should throw if not found', async () => {
      resourcePackageRepository.findOne.mockResolvedValue(null);
      await expect(service.removeResourcePackage(1)).rejects.toThrow(ResourcePackageNotFoundException);
    });

    it('should refuse to remove the default while another package stands in for its name (#1358)', async () => {
      givenTwoVersions({ GeoGebra: 'GeoGebra-5.3' });
      resourcePackageRepository.findOne.mockResolvedValue(installedPackage(1, 'GeoGebra-5.0.791'));

      await expect(service.removeResourcePackage(1)).rejects.toThrow(ConflictException);
      resourcePackageRepository.findOne.mockResolvedValue(installedPackage(2, 'GeoGebra-5.3'));
      await expect(service.removeResourcePackage(2)).rejects.toThrow(/workspace groups 'Group' chose it/);
      expect(resourcePackageRepository.delete).not.toHaveBeenCalled();
    });

    // side by side, the removals overwrote each other's change of the defaults
    it('should remove packages one after the other, so that the default of each goes', async () => {
      const avatar = installedPackage(1, 'avatar', 'avatar');
      const units = installedPackage(2, 'units', 'units');
      resourcePackageRepository.find.mockResolvedValue([avatar, units]);
      resourcePackageRepository.findOne.mockImplementation(async options => (
        (options as { where: { id: number } }).where.id === 1 ? avatar : units
      ));
      defaults = { avatar: 'avatar', units: 'units' };

      await service.removeResourcePackages([1, 2]);

      expect(defaults).toEqual({});
    });

    it('should remove the others of a selection when one is in use, and then say so', async () => {
      givenTwoVersions();
      const notInUse = installedPackage(2, 'GeoGebra-5.3');
      resourcePackageRepository.findOne.mockImplementation(async options => (
        (options as { where: { id: number } }).where.id === 1 ? installedPackage(1, 'GeoGebra-5.0.791') : notInUse
      ));

      await expect(service.removeResourcePackages([1, 2])).rejects.toThrow(ConflictException);
      expect(resourcePackageRepository.delete).toHaveBeenCalledWith(notInUse);
    });

    it('should remove the only package of its name with its files, and its default', async () => {
      const only = installedPackage(1, 'GeoGebra-5.3');
      resourcePackageRepository.find.mockResolvedValue([only]);
      resourcePackageRepository.findOne.mockResolvedValue(only);
      defaults = { GeoGebra: 'GeoGebra-5.3', avatar: 'avatar' };
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      await service.removeResourcePackage(1);

      expect(fs.rmSync).toHaveBeenCalledWith('./packages/GeoGebra-5.3', { recursive: true, force: true });
      expect(resourcePackageRepository.delete).toHaveBeenCalledWith(only);
      expect(defaults).toEqual({ avatar: 'avatar' });
    });
  });

  describe('patchPackageName', () => {
    it('should refuse a package in use', async () => {
      givenTwoVersions();
      resourcePackageRepository.findOne.mockResolvedValue(installedPackage(1, 'GeoGebra-5.0.791'));

      await expect(service.patchPackageName(1, 'GeoGebra3D')).rejects.toThrow(ConflictException);
      expect(resourcePackageRepository.save).not.toHaveBeenCalled();
    });

    it('should give a package not in use another name, and make it the default of a name new to it', async () => {
      givenTwoVersions();
      const notInUse = installedPackage(2, 'GeoGebra-5.3');
      resourcePackageRepository.findOne.mockResolvedValue(notInUse);

      await service.patchPackageName(2, ' GeoGebra3D ');

      expect(resourcePackageRepository.save)
        .toHaveBeenCalledWith(expect.objectContaining({ packageName: 'GeoGebra3D' }));
      expect(defaults).toEqual({ GeoGebra: 'GeoGebra-5.0.791', GeoGebra3D: 'GeoGebra-5.3' });
    });

    it('should respell the package name of a package in use, as names are compared regardless of case', async () => {
      givenTwoVersions();
      resourcePackageRepository.findOne.mockResolvedValue(installedPackage(1, 'GeoGebra-5.0.791'));

      await service.patchPackageName(1, 'geogebra');

      expect(resourcePackageRepository.save).toHaveBeenCalledWith(expect.objectContaining({ packageName: 'geogebra' }));
    });

    it('should refuse a package name that is empty, too long or holds a slash', async () => {
      await expect(service.patchPackageName(1, '  ')).rejects.toThrow(BadRequestException);
      await expect(service.patchPackageName(1, 'x'.repeat(101))).rejects.toThrow(BadRequestException);
      await expect(service.patchPackageName(1, 'Geo/Gebra')).rejects.toThrow(BadRequestException);
      await expect(service.patchPackageName(1, 7)).rejects.toThrow(BadRequestException);
    });
  });

  describe('create', () => {
    const installedFolder = path.resolve('./packages/GeoGebra-5.3');

    beforeEach(() => {
      resourcePackageRepository.create.mockImplementation(entity => entity as ResourcePackage);
      resourcePackageRepository.save.mockImplementation(async entity => entity as ResourcePackage);
    });

    it('should install a package under the package name its file name suggests, the first one as default', async () => {
      resourcePackageRepository.findOne.mockResolvedValue(null);
      resourcePackageRepository.find.mockResolvedValue([]);
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      zipOf(['GeoGebra/deployggb.js']);

      await service.create(upload('GeoGebra-5.3.itcr.zip'));

      expect(resourcePackageRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        name: 'GeoGebra-5.3', packageName: 'GeoGebra', elements: ['GeoGebra/deployggb.js']
      }));
      expect(fs.renameSync)
        .toHaveBeenCalledWith(expect.stringMatching(/^\.\/packages\/\.upload-/), installedFolder);
      expect(defaults).toEqual({ GeoGebra: 'GeoGebra-5.3' });
    });

    it('should leave the default alone when the package name has a package already', async () => {
      givenTwoVersions();
      resourcePackageRepository.findOne.mockResolvedValue(null);
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      zipOf([]);

      await service.create(upload('Something.itcr.zip'), { packageName: 'GeoGebra' });

      expect(resourcePackageRepository.save).toHaveBeenCalledWith(expect.objectContaining({ packageName: 'GeoGebra' }));
      expect(defaults).toEqual({ GeoGebra: 'GeoGebra-5.0.791' });
    });

    it('should throw a conflict if the package is installed and overwrite is not set', async () => {
      resourcePackageRepository.findOne.mockResolvedValue(installedPackage(2, 'GeoGebra-5.3'));
      zipOf([]);

      await expect(service.create(upload('GeoGebra-5.3.itcr.zip'))).rejects.toThrow(ConflictException);
      expect(fs.renameSync).not.toHaveBeenCalled();
    });

    it('should replace an installed package when told to, keeping its id and package name', async () => {
      const installed = installedPackage(2, 'GeoGebra-5.3');
      resourcePackageRepository.findOne.mockResolvedValue(installed);
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      zipOf(['GeoGebra/new.js']);

      const id = await service.create(upload('GeoGebra-5.3.itcr.zip'), { packageName: 'Other', overwrite: true });

      expect(id).toBe(2);
      expect(resourcePackageRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        id: 2, packageName: 'GeoGebra', elements: ['GeoGebra/new.js']
      }));
      // the old folder goes aside, the new one into its place, and the old one away
      const renames = (fs.renameSync as jest.Mock).mock.calls;
      expect(renames[0]).toEqual([installedFolder, expect.stringMatching(/-replaced$/)]);
      expect(renames[1]).toEqual([expect.stringMatching(/^\.\/packages\/\.upload-/), installedFolder]);
    });

    it('should put the replaced package back when the new one cannot take its place', async () => {
      resourcePackageRepository.findOne.mockResolvedValue(installedPackage(2, 'GeoGebra-5.3'));
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      zipOf([]);
      (fs.renameSync as jest.Mock)
        .mockImplementationOnce(() => undefined)
        .mockImplementationOnce(() => { throw new Error('EBUSY'); });

      await expect(service.create(upload('GeoGebra-5.3.itcr.zip'), { overwrite: true }))
        .rejects.toThrow(InternalServerErrorException);
      const renames = (fs.renameSync as jest.Mock).mock.calls;
      expect(renames[2]).toEqual([expect.stringMatching(/-replaced$/), installedFolder]);
      expect(resourcePackageRepository.save).not.toHaveBeenCalled();
    });

    it('should leave an installed package as it was when unpacking fails', async () => {
      resourcePackageRepository.findOne.mockResolvedValue(installedPackage(2, 'GeoGebra-5.3'));
      zipOf([], callback => callback(new Error('disk full')));

      await expect(service.create(upload('GeoGebra-5.3.itcr.zip'), { overwrite: true }))
        .rejects.toThrow(InternalServerErrorException);
      expect(fs.renameSync).not.toHaveBeenCalled();
      expect(fs.rmSync).toHaveBeenCalledWith(expect.stringMatching(/^\.\/packages\/\.upload-/), expect.anything());
      expect(resourcePackageRepository.save).not.toHaveBeenCalled();
    });

    it('should refuse a file name that leads out of the packages folder or into an upload folder', async () => {
      resourcePackageRepository.findOne.mockResolvedValue(null);
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      zipOf([]);

      await Promise.all(['...itcr.zip', '..itcr.zip', '.itcr.zip', '.upload-1.itcr.zip'].map(fileName => expect(
        service.create(upload(fileName), { packageName: 'GeoGebra', overwrite: true })
      ).rejects.toThrow(BadRequestException)));
      expect(AdmZipMock).not.toHaveBeenCalled();
      expect(fs.renameSync).not.toHaveBeenCalled();
    });

    it('should throw a bad request if file is not valid resource package', async () => {
      zipOf([]);
      await expect(service.create(upload('invalid.zip'))).rejects.toThrow(BadRequestException);
    });

    it('should throw an unprocessable entity if the file is not a readable zip', async () => {
      resourcePackageRepository.findOne.mockResolvedValue(null);
      AdmZipMock.mockImplementation(() => {
        throw new Error('Invalid or unsupported zip format. No END header found');
      });

      await expect(service.create(upload('broken.itcr.zip'))).rejects.toThrow(UnprocessableEntityException);
    });
  });
});
