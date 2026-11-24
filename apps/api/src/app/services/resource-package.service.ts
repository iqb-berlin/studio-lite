import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnprocessableEntityException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResourcePackageDto, WorkspaceGroupSettingsDto } from '@studio-lite-lib/api-dto';
import {
  byText,
  InstalledResourcePackage,
  RESOURCE_PACKAGE_ENDING,
  ResolvedResourcePackage,
  ResourcePackageChoice,
  ResourcePackageGroup,
  resolveResourcePackage,
  resourcePackageInUse,
  resourcePackageNameOf,
  resourcePackagesFor,
  suggestPackageName,
  withChosenResourcePackage
} from '@studio-lite/shared-code';
import { Express } from 'express';
import 'multer';
// adm-zip is CommonJS with no statically detectable named exports -- see the note on the adm-zip
// import in workspace-import.service.ts.
import AdmZip from 'adm-zip';
import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import { ResourcePackageNotFoundException } from '../exceptions/resource-package-not-found.exception';
import ResourcePackage from '../entities/resource-package.entity';
import Workspace from '../entities/workspace.entity';
import WorkspaceGroup from '../entities/workspace-group.entity';
import { SettingService } from './setting.service';
import { isPlainObject } from '../utils/is-plain-object';

/** The longest package name the database column takes. */
const PACKAGE_NAME_MAX_LENGTH = 100;

/** The installed packages, and how a package name resolves in one workspace. */
interface WorkspaceResolver {
  installed: InstalledResourcePackage[];
  resolve: (packageName: string) => ResolvedResourcePackage | null;
}

/**
 * Resource packages: a zip is unpacked into `./packages/<name>` on disk, and the database keeps the
 * name it is installed under, the package name it stands in for, the files it unpacked to and when
 * it arrived. The zip itself is kept as well, so a package can be handed back out unchanged.
 *
 * Several packages may stand in for one package name (#1358) -- `GeoGebra-5.0.791` and
 * `GeoGebra-5.3` for `GeoGebra`. Which of them a workspace gets is resolved by
 * `resolveResourcePackage` from the shared code: the one its group chose, else the default the
 * administrator set (stored by {@link SettingService}), else the one installed under exactly that
 * name.
 */
@Injectable()
export class ResourcePackageService {
  private readonly logger = new Logger(ResourcePackageService.name);
  private resourcePackagesPath = './packages'; // TODO Konfigurierbar

  constructor(
    @InjectRepository(ResourcePackage)
    private resourcePackageRepository: Repository<ResourcePackage>,
    @InjectRepository(Workspace)
    private workspaceRepository: Repository<Workspace>,
    @InjectRepository(WorkspaceGroup)
    private workspaceGroupRepository: Repository<WorkspaceGroup>,
    private settingService: SettingService
  ) {
  }

  async findResourcePackages(): Promise<ResourcePackageDto[]> {
    this.logger.log('Returning resource packages.');
    return this.resourcePackageRepository
      .find({
        order: { createdAt: 'DESC' }
      });
  }

  /** The default package per package name, `{ GeoGebra: 'GeoGebra-5.0.791' }`. */
  async findDefaults(): Promise<ResourcePackageChoice> {
    return this.settingService.findResourcePackageDefaults();
  }

  /**
   * Sets the defaults as a whole. Each must name an installed package standing in for its package
   * name; they are stored as spelt where installed.
   */
  async setDefaults(defaults: unknown): Promise<void> {
    if (!isPlainObject(defaults)) {
      throw new BadRequestException('The defaults must be an object of package names and packages.');
    }
    const installed = await this.findInstalled();
    const checked = Object.entries(defaults).map(([packageName, name]) => {
      const resolved = typeof name === 'string' ?
        resolveResourcePackage(packageName, installed, undefined, { [packageName]: name }) :
        null;
      if (resolved?.source !== 'default') {
        throw new BadRequestException(`'${name}' is no installed resource package standing in for '${packageName}'.`);
      }
      return [ResourcePackageService.packageNameOf(resolved.name, installed), resolved.name];
    });
    await this.settingService.patchResourcePackageDefaults(Object.fromEntries(checked));
  }

  /** Every workspace group with the packages it chose, by name -- what the administrator is shown. */
  async findGroups(): Promise<ResourcePackageGroup[]> {
    const groups = await this.workspaceGroupRepository.find({ select: { id: true, name: true, settings: true } });
    return groups
      .map(group => ({
        id: group.id,
        name: group.name,
        chosenResourcePackages: (group.settings as WorkspaceGroupSettingsDto)?.chosenResourcePackages
      }))
      .sort(byText(group => group.name));
  }

  /**
   * The installed package that serves a package name in a workspace, or null -- also when there is
   * no such workspace.
   */
  async resolveForWorkspace(packageName: string, workspaceId: number): Promise<ResolvedResourcePackage | null> {
    return (await this.resolverFor(workspaceId))?.resolve(packageName) ?? null;
  }

  /**
   * The package names units of a workspace can give and find served -- what the preview checks a
   * unit's dependencies against: those packages stand in for, and those they are installed under.
   */
  async findPackageNamesForWorkspace(workspaceId: number): Promise<string[]> {
    const resolver = await this.resolverFor(workspaceId);
    if (!resolver) return [];
    const names = resolver.installed.flatMap(resourcePackage => [resourcePackage.packageName, resourcePackage.name]);
    return [...new Set(names)].filter(name => resolver.resolve(name));
  }

  /**
   * Where a file a module asks for lies on disk: the first segment of the path is the package name,
   * the rest the path inside the package that serves it in this workspace. Empty segments are passed
   * over, so that `packages//GeoGebra/…` -- a module appending to the URL with a slash of its own --
   * finds the file all the same. Null when nothing serves the package name.
   */
  async findPackageFile(workspaceId: number, segments: string[]): Promise<{ root: string; file: string } | null> {
    const [packageName, ...rest] = segments.filter(segment => segment !== '');
    if (!packageName || !rest.length) return null;
    const resolved = await this.resolveForWorkspace(packageName, workspaceId);
    if (!resolved) return null;
    return {
      root: path.resolve(this.resourcePackagesPath, resolved.name),
      file: rest.join('/')
    };
  }

  /**
   * Whether a file name a unit gives (`GeoGebra.itcr.zip`) names a package that serves it in a
   * workspace -- what the import checks an enclosed package against (#1602).
   */
  async isServed(fileName: string, workspaceId: number): Promise<boolean> {
    return !!await this.resolveForWorkspace(resourcePackageNameOf(fileName), workspaceId);
  }

  /**
   * The zip of the package that serves a file name in a workspace, for the unit export (#1602): as it
   * was uploaded, but under the name it stands in for -- the name units give, spelt as the
   * administrator set it, not as one of the units happens to spell it. The testcenter unpacks a
   * package into a folder of its file name, and the modules ask for the folder of that name
   * (#1358). A package served by its own name keeps it. Null when no package serves the name or its
   * zip is not on disk.
   */
  async findZippedResourcePackage(
    fileName: string,
    workspaceId: number
  ): Promise<{ fileName: string; file: Buffer } | null> {
    const resolver = await this.resolverFor(workspaceId);
    const resolved = resolver?.resolve(resourcePackageNameOf(fileName));
    if (!resolver || !resolved) return null;
    const zipPath = `${this.resourcePackagesPath}/${resolved.name}/${resolved.name}${RESOURCE_PACKAGE_ENDING}`;
    if (!fs.existsSync(zipPath)) return null;
    const exportedName = resolved.source === 'file' ?
      resolved.name :
      ResourcePackageService.packageNameOf(resolved.name, resolver.installed);
    return { fileName: `${exportedName}${RESOURCE_PACKAGE_ENDING}`, file: fs.readFileSync(zipPath) };
  }

  /**
   * Removes the packages one after the other: each reads and writes the defaults, and removals side
   * by side would overwrite each other's change -- leaving the default of a removed package behind.
   * A package that cannot be removed does not stop the others; its error is thrown at the end.
   */
  async removeResourcePackages(ids: number[]): Promise<void> {
    const errors = await ids.reduce<Promise<unknown[]>>(
      async (previous, id) => {
        const errorsBefore = await previous;
        try {
          await this.removeResourcePackage(id);
          return errorsBefore;
        } catch (error) {
          return [...errorsBefore, error];
        }
      },
      Promise.resolve([])
    );
    if (errors.length) throw errors[0];
  }

  async removeResourcePackage(id: number): Promise<void> {
    this.logger.log(`Deleting resource package with id ${id}.`);
    const resourcePackage = await this.resourcePackageRepository
      .findOne({
        where: { id: id }
      });
    if (!resourcePackage) throw new ResourcePackageNotFoundException(id, 'DELETE');
    await this.assertNotInUse(resourcePackage);
    const elementPath = `${this.resourcePackagesPath}/${resourcePackage.name}`;
    if (fs.existsSync(elementPath)) {
      fs.rmSync(elementPath, { recursive: true, force: true });
    }
    await this.resourcePackageRepository.delete(resourcePackage);
    await this.dropDefault(resourcePackage);
  }

  /**
   * Gives a package another package name. Refused while it is in use -- a choice or the default
   * would point at nothing. The first package of its new package name becomes its default.
   */
  async patchPackageName(id: number, packageName: unknown): Promise<void> {
    const newPackageName = ResourcePackageService.checkPackageName(packageName);
    const resourcePackage = await this.resourcePackageRepository.findOne({ where: { id } });
    if (!resourcePackage) throw new ResourcePackageNotFoundException(id, 'PATCH');
    if (resourcePackage.packageName === newPackageName) return;
    // only spelt otherwise: names are compared regardless of case, so nothing it serves changes
    if (resourcePackage.packageName.toLowerCase() === newPackageName.toLowerCase()) {
      resourcePackage.packageName = newPackageName;
      await this.resourcePackageRepository.save(resourcePackage);
      return;
    }
    await this.assertNotInUse(resourcePackage);
    const others = (await this.findInstalled()).filter(other => other.name !== resourcePackage.name);
    await this.dropDefault(resourcePackage);
    resourcePackage.packageName = newPackageName;
    await this.resourcePackageRepository.save(resourcePackage);
    if (!resourcePackagesFor(newPackageName, others).length) {
      await this.setDefault(newPackageName, resourcePackage.name);
    }
  }

  /**
   * Installs an uploaded package standing in for the given package name, or the one its file name
   * suggests. A package already installed under that name is replaced only when `overwrite` says so;
   * it keeps its id and its package name. The first package of a package name becomes its default,
   * so that it serves the name from the start.
   */
  async create(
    zippedResourcePackage: Express.Multer.File,
    options: { packageName?: string; overwrite?: boolean } = {}
  ): Promise<number> {
    this.logger.log('Creating resource package');
    const packageNameArray = zippedResourcePackage.originalname.split(RESOURCE_PACKAGE_ENDING);
    if (packageNameArray.length !== 2) {
      throw new BadRequestException(
        `File name '${zippedResourcePackage.originalname}' does not end with '${RESOURCE_PACKAGE_ENDING}'`
      );
    }
    const name = packageNameArray[0];
    const folder = this.packageFolder(name);
    const packageName = ResourcePackageService.checkPackageName(
      options.packageName ?? suggestPackageName(zippedResourcePackage.originalname)
    );
    const existing = await this.resourcePackageRepository.findOne({ where: { name } });
    if (existing && !options.overwrite) {
      throw new ConflictException(`Resource package '${name}' is already installed`);
    }
    const { zip, packageFiles } = this.readZipArchive(zippedResourcePackage);
    await this.unpack(name, folder, zip, zippedResourcePackage);
    if (existing) {
      existing.elements = packageFiles;
      existing.createdAt = new Date();
      await this.resourcePackageRepository.save(existing);
      return existing.id;
    }
    const isFirst = !resourcePackagesFor(packageName, await this.findInstalled()).length;
    const id = await this.saveResourcePackage(name, packageName, packageFiles);
    if (isFirst) await this.setDefault(packageName, name);
    return id;
  }

  /**
   * The folder a package installed under `name` is unpacked into. The name comes from the file name
   * of the upload, so it must not lead out of the packages folder or into one of the folders an
   * upload is unpacked in first (`.upload-…`). The last check also refuses an empty name, `.` and
   * `..`; it is the form CodeQL recognizes as keeping a path inside a folder (js/path-injection).
   */
  private packageFolder(name: string): string {
    const root = path.resolve(this.resourcePackagesPath);
    const folder = path.resolve(root, name);
    if (name.startsWith('.') || name.includes('/') || !folder.startsWith(`${root}${path.sep}`)) {
      throw new BadRequestException(
        `'${name}${RESOURCE_PACKAGE_ENDING}' is no valid file name for a resource package`
      );
    }
    return folder;
  }

  private static checkPackageName(packageName: unknown): string {
    const trimmed = typeof packageName === 'string' ? packageName.trim() : '';
    if (!trimmed || trimmed.length > PACKAGE_NAME_MAX_LENGTH || trimmed.includes('/')) {
      throw new BadRequestException(
        `A package name is a text of 1 to ${PACKAGE_NAME_MAX_LENGTH} characters without '/'.`
      );
    }
    return trimmed;
  }

  private async findInstalled(): Promise<InstalledResourcePackage[]> {
    return this.resourcePackageRepository.find({ select: { name: true, packageName: true } });
  }

  private static packageNameOf(name: string, installed: InstalledResourcePackage[]): string {
    return installed.find(resourcePackage => resourcePackage.name === name)?.packageName ?? name;
  }

  /**
   * How package names resolve in a workspace: with the packages its group chose, the defaults and
   * the installed packages, read side by side. Null when there is no such workspace. A module asks
   * for every file of a package, so this is read once per file.
   */
  private async resolverFor(workspaceId: number): Promise<WorkspaceResolver | null> {
    const [workspace, installed, defaults] = await Promise.all([
      this.workspaceRepository.findOne({
        where: { id: workspaceId },
        relations: { workspaceGroup: true },
        select: { id: true, workspaceGroup: { id: true, settings: true } }
      }),
      this.findInstalled(),
      this.findDefaults()
    ]);
    if (!workspace) return null;
    const choice = (workspace.workspaceGroup?.settings as WorkspaceGroupSettingsDto | undefined)
      ?.chosenResourcePackages;
    return {
      installed,
      resolve: packageName => resolveResourcePackage(packageName, installed, choice, defaults)
    };
  }

  private async assertNotInUse(resourcePackage: ResourcePackage): Promise<void> {
    const [installed, groups, defaults] = await Promise.all([
      this.findInstalled(), this.findGroups(), this.findDefaults()
    ]);
    const use = resourcePackageInUse(resourcePackage, installed, groups, defaults);
    if (!use) return;
    const reasons = [
      use.isDefault ? `it is the default for '${resourcePackage.packageName}'` : '',
      use.groups.length ? `the workspace groups ${use.groups.map(group => `'${group.name}'`).join(', ')} chose it` : '',
      use.servesByName ? `it serves '${resourcePackage.packageName}' while no default is set` : ''
    ].filter(reason => reason);
    throw new ConflictException(`Resource package '${resourcePackage.name}' is in use: ${reasons.join('; ')}.`);
  }

  private async setDefault(packageName: string, name: string): Promise<void> {
    const defaults = await this.findDefaults();
    await this.settingService.patchResourcePackageDefaults(withChosenResourcePackage(defaults, packageName, name));
  }

  /** Takes a package out of the defaults when it leaves its package name or is deleted. */
  private async dropDefault(resourcePackage: ResourcePackage): Promise<void> {
    const defaults = await this.findDefaults();
    const kept = Object.entries(defaults).filter(([, name]) => name !== resourcePackage.name);
    if (kept.length !== Object.keys(defaults).length) {
      await this.settingService.patchResourcePackageDefaults(Object.fromEntries(kept));
    }
  }

  private readZipArchive(
    zippedResourcePackage: Express.Multer.File
  ): { zip: AdmZip; packageFiles: string[] } {
    try {
      const zip = new AdmZip(zippedResourcePackage.buffer);
      return {
        zip,
        packageFiles: zip.getEntries().map(entry => entry.entryName)
      };
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Reading '${zippedResourcePackage.originalname}' as zip failed: ${reason}`);
      throw new UnprocessableEntityException(
        `File '${zippedResourcePackage.originalname}' could not be read as a zip archive`
      );
    }
  }

  /**
   * Unpacks the zip beside the packages first and puts it in place only when that worked, so that a
   * failed upload leaves an installed package -- one being overwritten, or a folder left over from
   * an earlier one -- as it was.
   */
  private async unpack(
    name: string,
    target: string,
    zip: AdmZip,
    zippedResourcePackage: Express.Multer.File
  ): Promise<void> {
    const unpacked = `${this.resourcePackagesPath}/.upload-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const zipExtractAllToAsync = util.promisify(zip.extractAllToAsync);
    try {
      await zipExtractAllToAsync(unpacked, true, true);
      // named after the checked folder, which is where the export looks for it
      fs.writeFileSync(
        path.join(unpacked, `${path.basename(target)}${RESOURCE_PACKAGE_ENDING}`),
        zippedResourcePackage.buffer as unknown as Uint8Array
      );
    } catch {
      fs.rmSync(unpacked, { recursive: true, force: true });
      throw new InternalServerErrorException(`Creating resource package with name ${name} failed`);
    }
    if (!fs.existsSync(target)) {
      fs.renameSync(unpacked, target);
      return;
    }
    const replaced = `${unpacked}-replaced`;
    fs.renameSync(target, replaced);
    try {
      fs.renameSync(unpacked, target);
    } catch {
      // the package being replaced goes back into its place
      fs.renameSync(replaced, target);
      fs.rmSync(unpacked, { recursive: true, force: true });
      throw new InternalServerErrorException(`Replacing resource package with name ${name} failed`);
    }
    fs.rmSync(replaced, { recursive: true, force: true });
  }

  private async saveResourcePackage(name: string, packageName: string, packageFiles: string[]): Promise<number> {
    const newResourcePackage = this.resourcePackageRepository.create({
      name,
      packageName,
      elements: packageFiles,
      createdAt: new Date()
    });
    await this.resourcePackageRepository.save(newResourcePackage);
    return newResourcePackage.id;
  }
}
