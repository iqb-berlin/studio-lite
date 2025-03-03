import {
  UnitCommentDto,
  UnitDefinitionDto,
  UnitDownloadSettingsDto,
  UnitExportConfigDto,
  UnitPropertiesDto,
  UnitSchemeDto,
  VeronaModuleFileDto,
  VeronaModuleInListDto
} from '@studio-lite-lib/api-dto';
import * as AdmZip from 'adm-zip';
import * as XmlBuilder from 'xmlbuilder2';
import { VeronaModuleKeyCollection } from '@studio-lite/shared-code';
import { XMLBuilder } from 'xmlbuilder2/lib/interfaces';
import { UnitService } from '../services/unit.service';
import { VeronaModulesService } from '../services/verona-modules.service';
import { SettingService } from '../services/setting.service';
import { UnitCommentService } from '../services/unit-comment.service';

export class UnitDownloadClass {
  static async get(
    workspaceId: number,
    unitService: UnitService,
    unitCommentService: UnitCommentService,
    veronaModuleService: VeronaModulesService,
    settingService: SettingService,
    unitDownloadSettings: UnitDownloadSettingsDto
  ): Promise<Buffer> {
    const zip = new AdmZip();
    const unitsMetadata: UnitPropertiesDto[] = [];
    const usedPlayers: string[] = [];
    const unitExportConfig = await UnitDownloadClass.getUnitExportConfig(settingService);

    await Promise.all(unitDownloadSettings.unitIdList.map(async unitId => {
      await UnitDownloadClass.getUnitData(
        unitService,
        unitCommentService,
        unitId,
        workspaceId,
        unitDownloadSettings,
        unitExportConfig,
        unitsMetadata,
        usedPlayers,
        zip
      );
    }));

    if (unitDownloadSettings.addPlayers) {
      await UnitDownloadClass.addPlayers(veronaModuleService, zip, usedPlayers);
    }

    const loginCount = unitDownloadSettings.addTestTakersHot +
      unitDownloadSettings.addTestTakersMonitor +
      unitDownloadSettings.addTestTakersReview;
    if (loginCount > 0) {
      UnitDownloadClass.addBooklet(unitExportConfig, unitDownloadSettings, unitsMetadata, zip);
      UnitDownloadClass.addTestTakers(unitExportConfig, unitDownloadSettings, loginCount, zip);
    }
    return zip.toBuffer();
  }

  private static async getUnitExportConfig(settingService: SettingService): Promise<UnitExportConfigDto> {
    const unitExportConfig = new UnitExportConfigDto();
    const unitExportConfigFromDB = await settingService.findUnitExportConfig();

    if (unitExportConfigFromDB) {
      if (unitExportConfigFromDB.unitXsdUrl) unitExportConfig.unitXsdUrl = unitExportConfigFromDB.unitXsdUrl;
      if (unitExportConfigFromDB.bookletXsdUrl) unitExportConfig.bookletXsdUrl = unitExportConfigFromDB.bookletXsdUrl;
      if (unitExportConfigFromDB.testTakersXsdUrl) {
        unitExportConfig.testTakersXsdUrl = unitExportConfigFromDB.testTakersXsdUrl;
      }
    }
    return unitExportConfig;
  }

  private static async getUnitData(
    unitService: UnitService,
    unitCommentService: UnitCommentService,
    unitId: number,
    workspaceId: number,
    unitDownloadSettings: UnitDownloadSettingsDto,
    unitExportConfig: UnitExportConfigDto,
    unitsMetadata: UnitPropertiesDto[],
    usedPlayers: string[],
    zip: AdmZip
  ): Promise<void> {
    const unitMetadata = await unitService.findOnesMetadata(unitId, workspaceId);
    const unitXml = UnitDownloadClass.createUnitXML(unitExportConfig, unitMetadata);
    UnitDownloadClass.addMetadata(unitMetadata, zip);
    const definitionData = await unitService.findOnesDefinition(unitId);
    UnitDownloadClass.addUnitDefinition(definitionData, unitXml, unitMetadata, zip);
    UnitDownloadClass.addVariables(definitionData, unitXml);
    if (unitDownloadSettings.addComments) {
      const comments = await unitCommentService.findOnesComments(unitId);
      UnitDownloadClass.addComments(comments, unitXml, unitMetadata, zip);
    }
    const schemeData = await unitService.findOnesScheme(unitId);
    UnitDownloadClass.addScheme(schemeData, unitXml, unitMetadata, zip);
    zip.addFile(`${unitMetadata.key}.xml`, Buffer.from(unitXml.toString({ prettyPrint: true })));
    unitsMetadata.push(unitMetadata);
    if (usedPlayers.indexOf(unitMetadata.player) < 0) usedPlayers.push(unitMetadata.player);
  }

  private static createUnitXML(unitExportConfig: UnitExportConfigDto, unitMetadata: UnitPropertiesDto): XMLBuilder {
    return XmlBuilder.create({ version: '1.0' }, {
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
  }

  private static addMetadata(unitMetadata: UnitPropertiesDto, zip: AdmZip): void {
    if (Object.keys(unitMetadata.metadata).length !== 0) {
      zip.addFile(`${unitMetadata.key}.vomd`, Buffer.from(JSON.stringify(unitMetadata.metadata)));
    }
  }

  private static addUnitDefinition(
    definitionData: UnitDefinitionDto, unitXml: XMLBuilder, unitMetadata: UnitPropertiesDto, zip: AdmZip
  ): void {
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
  }

  private static addVariables(definitionData: UnitDefinitionDto, unitXml: XMLBuilder): void {
    if (definitionData.variables && definitionData.variables.length > 0) {
      const variablesElement = unitXml.root().ele('BaseVariables');
      definitionData.variables.forEach(transformedVariable => {
        const variableElement = variablesElement.ele({
          Variable: {
            '@id': transformedVariable.id,
            '@alias': transformedVariable.alias,
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
  }

  private static addComments(
    comments: UnitCommentDto[], unitXml: XMLBuilder, unitMetadata: UnitPropertiesDto, zip: AdmZip
  ): void {
    if (comments && comments.length) {
      unitXml.root().ele({
        UnitCommentsRef: {
          '#': `${unitMetadata.key}.vouc`
        }
      });
      zip.addFile(`${unitMetadata.key}.vouc`, Buffer.from(JSON.stringify(comments)));
    }
  }

  private static addScheme(
    schemeData: UnitSchemeDto, unitXml: XMLBuilder, unitMetadata: UnitPropertiesDto, zip: AdmZip
  ): void {
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
  }

  private static async addPlayers(
    veronaModuleService: VeronaModulesService, zip: AdmZip, usedPlayers: string[]
  ): Promise<void> {
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

  private static createBookletXml(unitExportConfig: UnitExportConfigDto): XMLBuilder {
    return XmlBuilder.create({ version: '1.0' }, {
      Booklet: {
        '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        '@xsi:noNamespaceSchemaLocation': unitExportConfig.bookletXsdUrl,
        Metadata: {
          Id: 'booklet1',
          Label: 'Testheft 1'
        }
      }
    });
  }

  private static addBooklet(
    unitExportConfig: UnitExportConfigDto,
    unitDownloadSettings: UnitDownloadSettingsDto,
    unitsMetadata: UnitPropertiesDto[],
    zip: AdmZip
  ): void {
    const bookletXml = UnitDownloadClass.createBookletXml(unitExportConfig);
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
  }

  private static createTestTakersXml(unitExportConfig: UnitExportConfigDto): XMLBuilder {
    return XmlBuilder.create({ version: '1.0' }, {
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
  }

  private static addTestTakers(
    unitExportConfig: UnitExportConfigDto,
    unitDownloadSettings: UnitDownloadSettingsDto,
    loginCount: number,
    zip: AdmZip
  ): void {
    const testTakerXml = UnitDownloadClass.createTestTakersXml(unitExportConfig);
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
