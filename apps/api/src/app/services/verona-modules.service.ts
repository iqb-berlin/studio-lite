import {
  Injectable, Logger, NotAcceptableException, StreamableFile
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  VeronaModuleFileDto, VeronaModuleInListDto, VeronaModuleMetadataDto, VeronaModuleType
} from '@studio-lite-lib/api-dto';
import * as cheerio from 'cheerio';
import { VeronaModuleKeyCollection, veronaModuleTypesMatch } from '@studio-lite/shared-code';
import type { Response } from 'express';
import VeronaModule from '../entities/verona-module.entity';
import { AdminVeronaModulesNotFoundException } from '../exceptions/admin-verona-modules-not-found.exception';

/**
 * The installed Verona modules: listing them by type, handing out a module's file, and taking a
 * new one in.
 *
 * An upload is an HTML file carrying its own metadata as JSON-LD, so the upload path reads the
 * document (cheerio) for the module's key and type rather than believing the caller. The types the
 * caller names are only the set the module's own type has to fall into; a module that declares
 * something else is refused with 406.
 */
@Injectable()
export class VeronaModulesService {
  private readonly logger = new Logger(VeronaModulesService.name);

  constructor(
    @InjectRepository(VeronaModule)
    private veronaModulesRepository: Repository<VeronaModule>
  ) {}

  async getVeronaModule(key: string, res: Response, download: boolean): Promise<StreamableFile | VeronaModuleFileDto> {
    if (download) {
      return this.downloadModuleById(key, res);
    }
    return this.findFileById(key);
  }

  private async downloadModuleById(key: string, res: Response): Promise<StreamableFile> {
    const fileData = await this.findFileById(key);
    res.set({
      'Content-Type': 'text/html',
      'Content-Disposition': `attachment; filename="${fileData.fileName}"`
    });
    return new StreamableFile(Buffer.from(fileData.file, 'utf8') as unknown as Uint8Array);
  }

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
        fileName: `${file.metadata.id}-${file.metadata.version}.html`,
        file: file.file.toString()
      };
    }
    throw new AdminVeronaModulesNotFoundException(key, 'GET');
  }

  async findAll(type?: string): Promise<VeronaModuleInListDto[]> {
    this.logger.log('Returning verona modules.');
    const veronaModules = (await this.veronaModulesRepository.find({
      select: ['key', 'metadata', 'fileSize', 'fileDateTime']
    })) ?? [];
    return veronaModules
      .filter(vm => !type || veronaModuleTypesMatch(vm.metadata?.type, type))
      .map(vm => <VeronaModuleInListDto>{
        key: vm.key,
        sortKey: VeronaModuleKeyCollection.getSortKey(vm.key),
        metadata: vm.metadata,
        fileSize: vm.fileSize,
        fileDateTime: vm.fileDateTime as unknown
      })
      .sort((
        a: VeronaModuleInListDto,
        b: VeronaModuleInListDto
      ) => (a.metadata.name + a.sortKey).localeCompare(b.metadata.name + b.sortKey));
  }

  async upload(fileData: Buffer, allowedTypes?: VeronaModuleType[]) {
    const fileAsString = fileData.toString('utf8');
    const htmlDocument = cheerio.load(fileAsString);
    const firstScriptElement = htmlDocument('script[type="application/ld+json"]').first();
    if (firstScriptElement) {
      const scriptContentAsString = firstScriptElement.contents().toString();
      const scriptContentAsJson = JSON.parse(scriptContentAsString);
      const veronaModuleMetadata = VeronaModuleMetadataDto.getFromJsonLd(scriptContentAsJson);
      if (veronaModuleMetadata) {
        if (allowedTypes &&
          !allowedTypes.some(t => veronaModuleTypesMatch(t, veronaModuleMetadata.type))) {
          throw new NotAcceptableException('verona module type not accepted');
        }
        const moduleKey = VeronaModuleMetadataDto.getKey(veronaModuleMetadata);
        const existingModule = await this.veronaModulesRepository.findOne({
          where: { key: moduleKey },
          select: { key: true }
        });
        if (existingModule) {
          existingModule.metadata = veronaModuleMetadata;
          existingModule.file = fileData as unknown as Uint8Array;
          existingModule.fileDateTime = new Date();
          existingModule.fileSize = fileAsString.length;
          await this.veronaModulesRepository.save(existingModule);
        } else {
          const newFile = this.veronaModulesRepository.create({
            key: moduleKey,
            metadata: veronaModuleMetadata,
            file: fileData as unknown as Uint8Array,
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
