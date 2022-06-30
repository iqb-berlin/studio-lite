import {UnitDownloadSettingsDto, VeronaModuleFileDto, VeronaModuleInListDto} from '@studio-lite-lib/api-dto';
import * as AdmZip from 'adm-zip';
import * as XmlBuilder from 'xmlbuilder2';
import { WorkspaceService } from '../database/services/workspace.service';
import { UnitService } from '../database/services/unit.service';
import { VeronaModulesService } from '../database/services/verona-modules.service';
import { VeronaModuleKeyCollection } from '@studio-lite/shared-code';
import { SettingService } from '../database/services/setting.service';
import { UnitExportConfigDto } from '@studio-lite-lib/api-dto';

export class UnitDownloadClass {
  static async get(
    workspaceService: WorkspaceService,
    unitService: UnitService,
    veronaModuleService: VeronaModulesService,
    settingService: SettingService,
    workspaceId: number,
    unitDownloadSettings: UnitDownloadSettingsDto
  ): Promise<Buffer> {
    const zip = new AdmZip();
    const unitKeys: string[] = [];
    const usedPlayers: string[] = [];
    const unitExportConfig = new UnitExportConfigDto();
    const unitExportConfigFromDB = await settingService.findUnitExportConfig();
    if (unitExportConfigFromDB) {
      if (unitExportConfigFromDB.unitXsdUrl) unitExportConfig.unitXsdUrl = unitExportConfigFromDB.unitXsdUrl;
      if (unitExportConfigFromDB.bookletXsdUrl) unitExportConfig.bookletXsdUrl = unitExportConfigFromDB.bookletXsdUrl;
      if (unitExportConfigFromDB.testTakersXsdUrl) unitExportConfig.testTakersXsdUrl = unitExportConfigFromDB.testTakersXsdUrl;
    }
    await Promise.all(unitDownloadSettings.unitIdList.map(async unitId => {
      const unitMetadata = await unitService.findOnesMetadata(unitId);
      const unitXml = XmlBuilder.create({ version: '1.0' }, {
        Unit: {
          '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
          '@xsi:noNamespaceSchemaLocation': unitExportConfig.unitXsdUrl,
          Metadata: {
            Id: unitMetadata.key,
            Label: unitMetadata.name,
            Description: unitMetadata.description
          }
        }
      });
      const definitionData = await unitService.findOnesDefinition(unitId);
      if (definitionData && definitionData.definition && definitionData.definition.length > 0) {
        unitXml.root().ele({
          DefinitionRef: {
            '@player': unitMetadata.player || '',
            '@editor': unitMetadata.editor || '',
            '#': `${unitMetadata.key}.voud`
          }
        });
        zip.addFile(`${unitMetadata.key}.voud`, Buffer.from(definitionData.definition));
      } else {
        unitXml.root().ele({
          Definition: {
            '@player': unitMetadata.player || '',
            '@editor': unitMetadata.editor || ''
          }
        });
      }
      zip.addFile(`${unitMetadata.key}.xml`, Buffer.from(unitXml.toString({ prettyPrint: true })));
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
    const loginCount = unitDownloadSettings.addTestTakersHot
      + unitDownloadSettings.addTestTakersMonitor
      + unitDownloadSettings.addTestTakersReview;
    if (loginCount > 0) {
      const bookletXml = XmlBuilder.create({ version: '1.0' }, {
        Booklet: {
          '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
          '@xsi:noNamespaceSchemaLocation': unitExportConfig.bookletXsdUrl,
          Metadata: {
            Id: 'booklet1',
            Label: 'Testheft 1'
          },
          BookletConfig: {
            Config: {
              '@key': 'unit_navibuttons',
              '#': 'FULL'
            }
          }
        }
      });
      let unitCount = 1;
      const unitsElement = bookletXml.root().ele('Units');
      unitKeys.forEach(u => {
        unitsElement.ele({
          Unit: {
            '@id': u,
            '@label': `Aufgabe ${unitCount}`,
            '@labelshort': `${unitCount}`
          }
        });
        unitCount += 1;
      });
      zip.addFile('booklet1.xml', Buffer.from(bookletXml.toString({ prettyPrint: true })));
      const testTakerXml = XmlBuilder.create({ version: '1.0' }, {
        Testtakers: {
          '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
          '@xsi:noNamespaceSchemaLocation': unitExportConfig.testTakersXsdUrl,
          Metadata: {},
          CustomTexts: {
            CustomText: {
              '@key': 'login_testEndButtonText',
              '#': 'Test beenden'
            }
          }
        }
      });
      const loginNames = UnitDownloadClass.generateCodeList(5, loginCount + 1);
      const loginPasswords = UnitDownloadClass.generateCodeList(4, loginCount);
      let loginIndex = 0;
      const groupElement = testTakerXml.root().ele({
        Group: {
          '@id': `TestTakerGroup_${loginNames[loginIndex]}`,
          '@label': 'Login-Gruppe A'
        }
      });
      for (let i = 0; i < unitDownloadSettings.addTestTakersHot; i++) {
        loginIndex += 1;
        const prefix = (unitDownloadSettings.addTestTakersMonitor > 0) ? `T${(i + 1).toString().padStart(2, '0')}_` : '';
        const loginElement = groupElement.ele({
          Login: {
            '@mode': 'run-hot-return',
            '@name': `${prefix}${loginNames[loginIndex]}`
          }
        });
        if (!unitDownloadSettings.passwordLess) loginElement.att('pw', loginPasswords[loginIndex-1]);
        loginElement.ele({
          Booklet: {
            '#': 'booklet1'
          }
        });
      }
      for (let i = 0; i < unitDownloadSettings.addTestTakersReview; i++) {
        loginIndex += 1;
        const loginElement = groupElement.ele({
          Login: {
            '@mode': 'run-review',
            '@name': loginNames[loginIndex]
          }
        });
        if (!unitDownloadSettings.passwordLess) loginElement.att('pw', loginPasswords[loginIndex-1]);
        loginElement.ele({
          Booklet: {
            '#': 'booklet1'
          }
        });
      }
      for (let i = 0; i < unitDownloadSettings.addTestTakersMonitor; i++) {
        loginIndex += 1;
        const prefix = (unitDownloadSettings.addTestTakersMonitor > 1) ? `TL${(i + 1).toString().padStart(2, '0')}_` : 'TL_';
        const loginElement = groupElement.ele({
          Login: {
            '@mode': 'monitor-group',
            '@name': `${prefix}${loginNames[loginIndex]}`
          }
        });
        if (!unitDownloadSettings.passwordLess) loginElement.att('pw', loginPasswords[loginIndex-1]);
      }
      zip.addFile('testtaker1.xml', Buffer.from(testTakerXml.toString({ prettyPrint: true })));
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
