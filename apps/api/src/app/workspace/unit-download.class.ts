import {
  UnitDownloadSettingsDto, UnitExportConfigDto, UnitMetadataDto, VeronaModuleFileDto, VeronaModuleInListDto
} from '@studio-lite-lib/api-dto';
import * as AdmZip from 'adm-zip';
import * as XmlBuilder from 'xmlbuilder2';
import { VeronaModuleKeyCollection } from '@studio-lite/shared-code';
import { UnitService } from '../database/services/unit.service';
import { VeronaModulesService } from '../database/services/verona-modules.service';
import { SettingService } from '../database/services/setting.service';

export class UnitDownloadClass {
  // TODO: Devide into submethods
  static async get(
    workspaceId: number,
    unitService: UnitService,
    veronaModuleService: VeronaModulesService,
    settingService: SettingService,
    unitDownloadSettings: UnitDownloadSettingsDto
  ): Promise<Buffer> {
    const zip = new AdmZip();
    const unitsMetadata: UnitMetadataDto[] = [];
    const usedPlayers: string[] = [];
    const unitExportConfig = new UnitExportConfigDto();
    const unitExportConfigFromDB = await settingService.findUnitExportConfig();
    if (unitExportConfigFromDB) {
      if (unitExportConfigFromDB.unitXsdUrl) unitExportConfig.unitXsdUrl = unitExportConfigFromDB.unitXsdUrl;
      if (unitExportConfigFromDB.bookletXsdUrl) unitExportConfig.bookletXsdUrl = unitExportConfigFromDB.bookletXsdUrl;
      if (unitExportConfigFromDB.testTakersXsdUrl) {
        unitExportConfig.testTakersXsdUrl = unitExportConfigFromDB.testTakersXsdUrl;
      }
    }
    await Promise.all(unitDownloadSettings.unitIdList.map(async unitId => {
      const unitMetadata = await unitService.findOnesMetadata(unitId, workspaceId);
      const unitXml = XmlBuilder.create({ version: '1.0' }, {
        Unit: {
          '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
          '@xsi:noNamespaceSchemaLocation': unitExportConfig.unitXsdUrl,
          Metadata: {
            '@lastChange': unitMetadata.lastChangedMetadata ? unitMetadata.lastChangedMetadata.toISOString() : '',
            Id: unitMetadata.key,
            Label: unitMetadata.name,
            Description: unitMetadata.description,
            Reference: Object.keys(unitMetadata.metadata).length !== 0 ? `${unitMetadata.key}.vomd` : ''
          }
        }
      });
      if (Object.keys(unitMetadata.metadata).length !== 0) {
        zip.addFile(`${unitMetadata.key}.vomd`, Buffer.from(JSON.stringify(unitMetadata.metadata)));
      }
      const definitionData = await unitService.findOnesDefinition(unitId);
      if (definitionData && definitionData.definition && definitionData.definition.length > 0) {
        unitXml.root().ele({
          DefinitionRef: {
            '@player': unitMetadata.player || '',
            '@editor': unitMetadata.editor || '',
            '@lastChange': unitMetadata.lastChangedDefinition ? unitMetadata.lastChangedDefinition.toISOString() : '',
            '#': `${unitMetadata.key}.voud`
          }
        });
        zip.addFile(`${unitMetadata.key}.voud`, Buffer.from(definitionData.definition));
      } else {
        unitXml.root().ele({
          Definition: {
            '@player': unitMetadata.player || '',
            '@editor': unitMetadata.editor || '',
            '@lastChange': unitMetadata.lastChangedDefinition ? unitMetadata.lastChangedDefinition.toISOString() : ''
          }
        });
      }
      if (definitionData.variables && definitionData.variables.length > 0) {
        const variablesElement = unitXml.root().ele('BaseVariables');
        definitionData.variables.forEach(transformedVariable => {
          const variableElement = variablesElement.ele({
            Variable: {
              '@id': transformedVariable.id,
              '@type': transformedVariable.type,
              '@format': transformedVariable.format,
              '@nullable': transformedVariable.nullable,
              '@multiple': transformedVariable.multiple,
              '@page': transformedVariable.page
            }
          });
          if (transformedVariable.valuePositionLabels && transformedVariable.valuePositionLabels.length) {
            const valuePositionLabelsElement = variableElement.ele('ValuePositionLabels');
            transformedVariable.valuePositionLabels.forEach(label => {
              valuePositionLabelsElement.ele({ ValuePositionLabel: { '#': label } });
            });
          }
          if (transformedVariable.values && transformedVariable.values.length) {
            const valuesElement = variableElement.ele({
              Values: {
                '@complete': transformedVariable.valuesComplete
              }
            });
            transformedVariable.values.forEach(val => {
              valuesElement.ele({ Value: { '#': val } });
            });
          }
        });
      }
      const schemeData = await unitService.findOnesScheme(unitId);
      if (schemeData && schemeData.scheme) {
        unitXml.root().ele({
          CodingSchemeRef: {
            '@schemer': unitMetadata.schemer || '',
            '@schemeType': unitMetadata.schemeType || '',
            '@lastChange': unitMetadata.lastChangedScheme ? unitMetadata.lastChangedScheme.toISOString() : '',
            '#': `${unitMetadata.key}.vocs`
          }
        });
        zip.addFile(`${unitMetadata.key}.vocs`, Buffer.from(schemeData.scheme));
      } else {
        unitXml.root().ele({
          CodingSchemeRef: {
            '@schemer': unitMetadata.schemer || '',
            '@lastChange': unitMetadata.lastChangedScheme ? unitMetadata.lastChangedScheme.toISOString() : ''
          }
        });
      }
      zip.addFile(`${unitMetadata.key}.xml`, Buffer.from(unitXml.toString({ prettyPrint: true })));
      unitsMetadata.push(unitMetadata);
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
            zip.addFile(playerData.fileName, Buffer.from(playerData.file));
            addedPlayers.push(bestMatch);
          }
        }
      }));
    }
    const loginCount = unitDownloadSettings.addTestTakersHot +
      unitDownloadSettings.addTestTakersMonitor +
      unitDownloadSettings.addTestTakersReview;
    if (loginCount > 0) {
      const bookletXml = XmlBuilder.create({ version: '1.0' }, {
        Booklet: {
          '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
          '@xsi:noNamespaceSchemaLocation': unitExportConfig.bookletXsdUrl,
          Metadata: {
            Id: 'booklet1',
            Label: 'Testheft 1'
          }
        }
      });
      const configElement = bookletXml.root().ele('BookletConfig');
      unitDownloadSettings.bookletSettings.forEach(bc => {
        configElement.ele({
          Config: {
            '@key': bc.key,
            '#': bc.value
          }
        });
      });
      let unitCount = 1;
      const unitsElement = bookletXml.root().ele('Units');
      unitsMetadata.forEach(u => {
        unitsElement.ele({
          Unit: {
            '@id': u.key,
            '@label': u.name || `Aufgabe ${unitCount}`,
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
      let codeLen = loginCount > 1000 ? 8 : 5;
      if (unitDownloadSettings.passwordLess) codeLen += 2;
      const loginNames = UnitDownloadClass.generateCodeList(codeLen, loginCount + 1);
      const loginPasswords = unitDownloadSettings.passwordLess ? <string[]>[] :
        UnitDownloadClass.generateCodeList(loginCount > 1000 ? 5 : 4, loginCount);
      let loginIndex = 0;
      const groupElement = testTakerXml.root().ele({
        Group: {
          '@id': `TestTakerGroup_${loginNames[loginIndex]}`,
          '@label': 'Login-Gruppe A'
        }
      });
      for (let i = 0; i < unitDownloadSettings.addTestTakersHot; i++) {
        loginIndex += 1;
        const prefix = (unitDownloadSettings.addTestTakersMonitor > 0) ?
          `T${(i + 1).toString().padStart(2, '0')}_` : '';
        const loginElement = groupElement.ele({
          Login: {
            '@mode': 'run-hot-return',
            '@name': `${prefix}${loginNames[loginIndex]}`
          }
        });
        if (!unitDownloadSettings.passwordLess) loginElement.att('pw', loginPasswords[loginIndex - 1]);
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
        if (!unitDownloadSettings.passwordLess) loginElement.att('pw', loginPasswords[loginIndex - 1]);
        loginElement.ele({
          Booklet: {
            '#': 'booklet1'
          }
        });
      }
      for (let i = 0; i < unitDownloadSettings.addTestTakersMonitor; i++) {
        loginIndex += 1;
        const prefix = (unitDownloadSettings.addTestTakersMonitor > 1) ?
          `TL${(i + 1).toString().padStart(2, '0')}_` : 'TL_';
        const loginElement = groupElement.ele({
          Login: {
            '@mode': 'monitor-group',
            '@name': `${prefix}${loginNames[loginIndex]}`
          }
        });
        if (!unitDownloadSettings.passwordLess) loginElement.att('pw', loginPasswords[loginIndex - 1]);
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
