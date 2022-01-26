import {Injectable, NotAcceptableException, UnauthorizedException} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import { Repository} from "typeorm";
import VeronaModule from "../entities/verona-module.entity";
import {VeronaModuleInListDto, VeronaModuleMetadataDto} from "@studio-lite-lib/api-dto";
import * as cheerio from "cheerio";

@Injectable()
export class VeronaModulesService {
  constructor(
    @InjectRepository(VeronaModule)
    private veronaModulesRepository: Repository<VeronaModule>)
  {}

  async findAll(type?: string): Promise<VeronaModuleInListDto[]> {
    const veronaModules = await this.veronaModulesRepository.query(
      'SELECT key, metadata from verona_module');
    const returnVeronaModules: VeronaModuleInListDto[] = [];
    veronaModules.forEach(veronaModule => {
      if (!type || veronaModule.metadata.type === type) {
        returnVeronaModules.push(veronaModule);
      }
    });
    return returnVeronaModules
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
        const newFile = await this.veronaModulesRepository.create({
          key: `${veronaModuleMetadata.id}@${veronaModuleMetadata.version}`,
          metadata: veronaModuleMetadata,
          file: fileData,
          fileSize: fileAsString.length
        })
        await this.veronaModulesRepository.save(newFile);
        return
      }
    }
    throw new NotAcceptableException('verona module metadata invalid');
  }
}
