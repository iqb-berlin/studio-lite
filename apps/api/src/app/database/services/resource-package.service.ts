import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResourcePackageDto } from '@studio-lite-lib/api-dto';
import { Express } from 'express';
import 'multer';
import * as AdmZip from 'adm-zip';
import * as fs from 'fs';
import ResourcePackage from '../entities/resource-package.entity';
import { ResourcePackageNotFoundException } from '../../exceptions/resource-package-not-found.exception';

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
          // eslint-disable-next-line no-empty
          if (fs.lstatSync(elementPath).isDirectory()) {
            // delete all
            fs.rmSync(elementPath, { recursive: true, force: true });
          } else {
            // if there are any rests
            fs.unlink(elementPath, (err => {
              if (err) console.log(err);
              else {
                console.log(`Deleted file: ${element}`);
              }
            }));
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
    zip.extractAllToAsync(this.resourcePackagePath, true, true, err => {
      if (err) console.log('##############z#Encountered error while unzipping', err);
      console.log('######################All files are now unzipped!');
    });
    const newResourcePackage = this.resourcePackageRepository.create({
      name: zippedResourcePackage.originalname,
      elements: packageFiles,
      createdAt: new Date()
    });
    await this.resourcePackageRepository.save(newResourcePackage);
    return newResourcePackage.id;
  }
}
