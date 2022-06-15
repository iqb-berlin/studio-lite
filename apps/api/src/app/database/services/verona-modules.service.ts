import { Injectable, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getConnection, Repository } from 'typeorm';
import { VeronaModuleFileDto, VeronaModuleInListDto, VeronaModuleMetadataDto } from '@studio-lite-lib/api-dto';
import * as cheerio from 'cheerio';
import VeronaModule from '../entities/verona-module.entity';

@Injectable()
export class VeronaModulesService {
  constructor(
    @InjectRepository(VeronaModule)
    private veronaModulesRepository: Repository<VeronaModule>
  ) {}

  async findFileById(key: string): Promise<VeronaModuleFileDto> {
    const file = await this.veronaModulesRepository.findOne({
      where: { key: key },
      select: ['file', 'key', 'metadata']
    });
    return <VeronaModuleFileDto>{
      key: file.key,
      name: file.metadata.name,
      file: file.file.toString()
    };
  }

  async findAll(type?: string): Promise<VeronaModuleInListDto[]> {
    const veronaModules = await this.veronaModulesRepository.query(
      'SELECT key, metadata, file_size, file_datetime from verona_module'
    );
    const returnVeronaModules: VeronaModuleInListDto[] = [];
    veronaModules.forEach(veronaModule => {
      if (!type || veronaModule.metadata.type === type) {
        returnVeronaModules.push(<VeronaModuleInListDto>{
          key: veronaModule.key,
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
        const existingModule = await this.veronaModulesRepository.find({
          where: { key: moduleKey },
          select: ['key']
        });
        if (existingModule && existingModule.length > 0) {
          await getConnection()
            .createQueryBuilder()
            .update(VeronaModule)
            .set({
              metadata: veronaModuleMetadata,
              file: fileData,
              fileDateTime: new Date().toISOString(),
              fileSize: fileAsString.length
            })
            .where('key = :key', { key: moduleKey })
            .execute();
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
    await this.veronaModulesRepository.delete(key);
  }
}
