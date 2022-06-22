import {UnitDownloadSettingsDto, VeronaModuleFileDto, VeronaModuleInListDto} from '@studio-lite-lib/api-dto';
import * as AdmZip from 'adm-zip';
import * as XmlBuilder from 'xmlbuilder2';
import { WorkspaceService } from '../database/services/workspace.service';
import { UnitService } from '../database/services/unit.service';
import {VeronaModulesService} from "../database/services/verona-modules.service";
import {VeronaModuleKeyCollection} from "@studio-lite/shared-code";

const unitXsdUrl =
  'https://raw.githubusercontent.com/iqb-berlin/testcenter-backend/master/definitions/vo_Unit.xsd';

const bookletXsdUrl =
  'https://raw.githubusercontent.com/iqb-berlin/testcenter-backend/master/definitions/vo_Booklet.xsd';

const testTakersXsdUrl =
  'https://raw.githubusercontent.com/iqb-berlin/testcenter-backend/master/definitions/vo_Testtakers.xsd';

export class UnitDownloadClass {
  static async get(
    workspaceService: WorkspaceService,
    unitService: UnitService,
    veronaModuleService: VeronaModulesService,
    workspaceId: number,
    unitDownloadSettings: UnitDownloadSettingsDto
  ): Promise<Buffer> {
    const zip = new AdmZip();
    const unitKeys: string[] = [];
    const usedPlayers: string[] = [];
    await Promise.all(unitDownloadSettings.unitIdList.map(async unitId => {
      const unitMetadata = await unitService.findOnesMetadata(workspaceId, unitId);
      const doc = XmlBuilder.create({ version: '1.0' }, {
        Unit: {
          '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
          '@xsi:noNamespaceSchemaLocation': unitXsdUrl,
          '@att': 'val',
          Metadata: {
            Id: unitMetadata.key,
            Label: unitMetadata.name,
            Description: unitMetadata.description
          },
          DefinitionRef: {
            '@player': unitMetadata.player,
            '@editor': unitMetadata.editor,
            '#': `${unitMetadata.key}.voud`
          }
        }
      });
      zip.addFile(`${unitMetadata.key}.xml`, Buffer.from(doc.toString({ prettyPrint: true })));
      const definition = await unitService.findOnesDefinition(workspaceId, unitId);
      zip.addFile(`${unitMetadata.key}.voud`, Buffer.from(definition.definition));
      unitKeys.push(unitMetadata.key);
      if (usedPlayers.indexOf(unitMetadata.player) < 0) usedPlayers.push(unitMetadata.player);
    }));
    if (unitDownloadSettings.addPlayers) {
      const allPlayers: VeronaModuleInListDto[] = await veronaModuleService.findAll('player');
      const veronaKeyList = new VeronaModuleKeyCollection(allPlayers.map(p => p.key));
      const addedPlayers: string[] = [];
      await Promise.all(usedPlayers.map(async p => {
        if (addedPlayers.indexOf(p) < 0) {
          const bestMatch = veronaKeyList.getBestMatch(p);
          if (bestMatch && addedPlayers.indexOf(bestMatch) < 0) {
            const playerData: VeronaModuleFileDto = await veronaModuleService.findFileById(bestMatch);
            zip.addFile(`${bestMatch}.html`, Buffer.from(playerData.file));
            addedPlayers.push(bestMatch);
          }
        }
      }))
    }
    return zip.toBuffer();
  }

  static generateCodeList(codeLen: number, codeCount: number): string[] {
    const codeCharacters = 'abcdefghprqstuvxyz';
    const codeNumbers = '2345679';
    const codeList: string[] = [];
    for (let i = 0; i < codeCount; i++) {
      let newCode = '';
      do {
        newCode = '';
        let isNumber = false;
        do {
          newCode += isNumber ?
            codeNumbers.substr(Math.floor(codeNumbers.length * Math.random()), 1) :
            codeCharacters.substr(Math.floor(codeCharacters.length * Math.random()), 1);
          isNumber = !isNumber;
        } while (newCode.length < codeLen);
      } while (codeList.indexOf(newCode) >= 0);
      codeList.push(newCode);
    }
    return codeList;
  }
}
