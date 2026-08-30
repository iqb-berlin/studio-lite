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
import { ResourcePackageDto } from '@studio-lite-lib/api-dto';
import { Express } from 'express';
import 'multer';
import * as AdmZip from 'adm-zip';
import * as fs from 'fs';
import * as util from 'util';
import { ResourcePackageNotFoundException } from '../exceptions/resource-package-not-found.exception';
import ResourcePackage from '../entities/resource-package.entity';

/**
 * Resource packages: a zip is unpacked into `./packages` on disk, and the database keeps only the
 * package's name, the files it unpacked to, and when it arrived. The zip itself is kept as well, so
 * a package can be handed back out unchanged.
 */
@Injectable()
export class ResourcePackageService {
  private readonly logger = new Logger(ResourcePackageService.name);
  private resourcePackagesPath = './packages'; // TODO Konfigurierbar

  constructor(
    @InjectRepository(ResourcePackage)
    private resourcePackageRepository: Repository<ResourcePackage>
  ) {
  }

  async findResourcePackages(): Promise<ResourcePackageDto[]> {
    this.logger.log('Returning resource packages.');
    return this.resourcePackageRepository
      .find({
        order: { createdAt: 'DESC' }
      });
  }

  async removeResourcePackages(ids: number[]): Promise<void> {
    await Promise.all(ids.map(async id => this.removeResourcePackage(id)));
  }

  async removeResourcePackage(id: number): Promise<void> {
    this.logger.log(`Deleting sss resource package with id ${id}.`);
    const resourcePackage = await this.resourcePackageRepository
      .findOne({
        where: { id: id }
      });
    if (resourcePackage) {
      const elementPath = `${this.resourcePackagesPath}/${resourcePackage.name}`;
      if (fs.existsSync(elementPath)) {
        fs.rmSync(elementPath, { recursive: true, force: true });
      }
      await this.resourcePackageRepository.delete(resourcePackage);
    } else {
      throw new ResourcePackageNotFoundException(id, 'DELETE');
    }
  }

  async create(zippedResourcePackage: Express.Multer.File): Promise<number> {
    this.logger.log('Creating resource package');
    const packageNameArray = zippedResourcePackage.originalname.split('.itcr.zip');
    if (packageNameArray.length !== 2) {
      throw new BadRequestException(
        `File name '${zippedResourcePackage.originalname}' does not end with '.itcr.zip'`
      );
    }
    const packageName = packageNameArray[0];
    const resourcePackage = await this.resourcePackageRepository
      .findOne({
        where: { name: packageName }
      });
    if (resourcePackage) {
      throw new ConflictException(`Resource package '${packageName}' is already installed`);
    }
    const { zip, packageFiles } = this.readZipArchive(zippedResourcePackage);
    const zipExtractAllToAsync = util.promisify(zip.extractAllToAsync);
    return zipExtractAllToAsync(`${this.resourcePackagesPath}/${packageName}`, true, true)
      .then(() => {
        this.storeZippedResourcePackage(packageName, zippedResourcePackage);
        return this.saveResourcePackage(packageName, packageFiles);
      },
      () => {
        throw new InternalServerErrorException(
          `Creating resource package with name ${packageName} failed`
        );
      });
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

  private async saveResourcePackage(packageName: string, packageFiles: string[]): Promise<number> {
    const newResourcePackage = this.resourcePackageRepository.create({
      name: packageName,
      elements: packageFiles,
      createdAt: new Date()
    });
    await this.resourcePackageRepository.save(newResourcePackage);
    return newResourcePackage.id;
  }

  private storeZippedResourcePackage(packageName: string, zippedResourcePackage: Express.Multer.File): void {
    fs.writeFileSync(
      `${this.resourcePackagesPath}/${packageName}/${zippedResourcePackage.originalname}`,
      zippedResourcePackage.buffer as unknown as Uint8Array
    );
  }

  getZippedResourcePackage(name: string): Buffer {
    this.logger.log('Returning zipped resource package.');
    return fs.readFileSync(`${this.resourcePackagesPath}/${name}/${name}.itcr.zip`);
  }
}
