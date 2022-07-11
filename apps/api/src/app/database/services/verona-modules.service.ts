import { Injectable, Logger, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VeronaModuleFileDto, VeronaModuleInListDto, VeronaModuleMetadataDto } from '@studio-lite-lib/api-dto';
import * as cheerio from 'cheerio';
import { VeronaModuleKeyCollection } from '@studio-lite/shared-code';
import VeronaModule from '../entities/verona-module.entity';
import { AdminVeronaModulesNotFoundException } from '../../exceptions/admin-verona-modules-not-found.exception';

@Injectable()
export class VeronaModulesService {
  private readonly logger = new Logger(VeronaModulesService.name);

  constructor(
    @InjectRepository(VeronaModule)
    private veronaModulesRepository: Repository<VeronaModule>
  ) {}

  async findFileById(key: string): Promise<VeronaModuleFileDto> {
    this.logger.log(`Returning verona module with key: ${key}`);
    const file = await this.veronaModulesRepository.findOne({
      where: { key: key },
      select: ['file', 'key', 'metadata']
    });
    if (file) {
      return <VeronaModuleFileDto>{
        key: file.key,
        name: file.metadata.name,
        file: file.file.toString()
      };
    }
    throw new AdminVeronaModulesNotFoundException(key, 'GET');
  }

  async findAll(type?: string): Promise<VeronaModuleInListDto[]> {
    this.logger.log('Returning verona modules.');
    const veronaModules = await this.veronaModulesRepository.query(
      'SELECT key, metadata, file_size, file_datetime from verona_module'
    );
    const returnVeronaModules: VeronaModuleInListDto[] = [];
    veronaModules.forEach(veronaModule => {
      if (!type || veronaModule.metadata.type === type) {
        returnVeronaModules.push(<VeronaModuleInListDto>{
          key: veronaModule.key,
          sortKey: VeronaModuleKeyCollection.getSortKey(veronaModule.key),
          metadata: veronaModule.metadata,
          fileSize: veronaModule.file_size,
          fileDateTime: veronaModule.file_datetime
        });
      }
    });
    return returnVeronaModules;
  }

  async upload(fileData: Buffer) {
    const fileAsString = fileData.toString('utf8');
    const htmlDocument = cheerio.load(fileAsString);
    const firstScriptElement = htmlDocument('script[type="application/ld+json"]').first();
    if (firstScriptElement) {
      const scriptContentAsString = firstScriptElement.contents().toString();
      const scriptContentAsJson = JSON.parse(scriptContentAsString);
      const veronaModuleMetadata = VeronaModuleMetadataDto.getFromJsonLd(scriptContentAsJson);
      if (veronaModuleMetadata) {
        const moduleKey = VeronaModuleMetadataDto.getKey(veronaModuleMetadata);
        const existingModule = await this.veronaModulesRepository.findOne({
          where: { key: moduleKey }
        });
        if (existingModule) {
          existingModule.metadata = veronaModuleMetadata;
          existingModule.file = fileData;
          existingModule.fileDateTime = new Date();
          existingModule.fileSize = fileAsString.length;
          await this.veronaModulesRepository.save(existingModule);
        } else {
          const newFile = await this.veronaModulesRepository.create({
            key: moduleKey,
            metadata: veronaModuleMetadata,
            file: fileData,
            fileSize: fileAsString.length
          });
          await this.veronaModulesRepository.save(newFile);
        }
        return;
      }
    }
    throw new NotAcceptableException('verona module metadata invalid');
  }

  async remove(key: string | string[]): Promise<void> {
    this.logger.log(`Deleting verona module with key: ${key}`);
    await this.veronaModulesRepository.delete(key);
  }
}
