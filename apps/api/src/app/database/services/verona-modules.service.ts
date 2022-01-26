import { Injectable } from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import { Repository} from "typeorm";
import VeronaModule from "../entities/verona-module.entity";
import {VeronaModuleInListDto, VeronaModuleMetadataDto} from "@studio-lite-lib/api-dto";

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
        veronaModule.metadata = VeronaModuleMetadataDto.getFromJsonLd(veronaModule.metadata);
        returnVeronaModules.push(veronaModule);
      }
    });
    return returnVeronaModules
  }

  async upload(fileData: Buffer) {
    const newFile = await this.veronaModulesRepository.create({
      key: 'sosososo',
      file: fileData
    })
    await this.veronaModulesRepository.save(newFile);
  }
}
