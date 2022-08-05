import {
  Injectable, Logger
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResourcePackageDto } from '@studio-lite-lib/api-dto';
import { Express } from 'express';
import 'multer';
import * as AdmZip from 'adm-zip';
import * as fs from 'fs';
import { CannotCreateFileException } from '@angular-devkit/schematics/src/tree/null';
import * as util from 'util';
import { ResourcePackageNotFoundException } from '../../exceptions/resource-package-not-found.exception';
import ResourcePackage from '../entities/resource-package.entity';

@Injectable()
export class ResourcePackageService {
  private readonly logger = new Logger(ResourcePackageService.name);
  private resourcePackagePath = './resourcePackages'; // TODO Konfigurierbar

  constructor(
    @InjectRepository(ResourcePackage)
    private resourcePackageRepository: Repository<ResourcePackage>
  ) {}

  async findResourcePackages(): Promise<ResourcePackageDto[]> {
    this.logger.log('Returning resource packages.');
    return this.resourcePackageRepository
      .find({
        order: { createdAt: 'DESC' }
      });
  }

  async removeResourcePackage(id: number): Promise<void> {
    this.logger.log(`Deleting resource package with id ${id}.`);
    const resourcePackage = await this.resourcePackageRepository
      .findOne({
        where: { id: id }
      });
    if (resourcePackage) {
      resourcePackage.elements.forEach(element => {
        const elementPath = `${this.resourcePackagePath}/${element}`;
        if (fs.existsSync(elementPath)) {
          if (fs.lstatSync(elementPath).isDirectory()) {
            // delete all
            fs.rmSync(elementPath, { recursive: true, force: true });
          } else {
            // if there are any rests
            fs.unlinkSync(elementPath);
          }
        }
      });
      await this.resourcePackageRepository.delete(resourcePackage);
    } else {
      throw new ResourcePackageNotFoundException(id, 'DELETE');
    }
  }

  async create(zippedResourcePackage: Express.Multer.File): Promise<number> {
    this.logger.log('Creating resource package.');
    const zip = new AdmZip(zippedResourcePackage.buffer);
    const packageFiles = zip.getEntries().map(entry => entry.entryName);
    const zipExtractAllToAsync = util.promisify(zip.extractAllToAsync);
    return zipExtractAllToAsync(this.resourcePackagePath, true, true)
      .then(async () => {
        const newResourcePackage = this.resourcePackageRepository.create({
          name: zippedResourcePackage.originalname,
          elements: packageFiles,
          createdAt: new Date()
        });
        await this.resourcePackageRepository.save(newResourcePackage);
        return newResourcePackage.id;
      })
      .catch(() => { throw new CannotCreateFileException(this.resourcePackagePath); });
  }
}
