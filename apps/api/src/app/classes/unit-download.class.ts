import {
  UnitDownloadSettingsDto, UnitExportConfigDto, UnitPropertiesDto, VeronaModuleFileDto, VeronaModuleInListDto
} from '@studio-lite-lib/api-dto';
// adm-zip is CommonJS with no statically detectable named exports -- see the note on the adm-zip
// import in workspace.service.ts.
import AdmZip from 'adm-zip';
import { VeronaModuleKeyCollection } from '@studio-lite/shared-code';
import { UnitService } from '../services/unit.service';
import { UnitMetadataService } from '../services/unit-metadata.service';
import { UnitDefinitionService } from '../services/unit-definition.service';
import { ExportReportMessage } from './export-report.class';
import { EXPORT_REPORT_FILENAME } from '../interfaces/unit-json-specs.interface';
import { VeronaModulesService } from '../services/verona-modules.service';
import { SettingService } from '../services/setting.service';
import { UnitCommentService } from '../services/unit-comment.service';
import { UnitRichNoteService } from '../services/unit-rich-note.service';
import { BookletDownloadClass } from './booklet-download.class';
import { UnitJsonDownloadClass } from './unit-json-download.class';
import { UnitXmlDownloadClass } from './unit-xml-download.class';

/**
 * The download of units: a zip with every unit in the chosen format, and beside them the players
 * they name and -- for the testcenter, XML only -- a booklet and its test takers. Each format is a
 * class of its own; this one decides which of them to ask and gathers what they write.
 */
export class UnitDownloadClass {
  static async get(
    workspaceId: number,
    unitService: UnitService,
    unitMetadataService: UnitMetadataService,
    unitDefinitionService: UnitDefinitionService,
    unitCommentService: UnitCommentService,
    veronaModuleService: VeronaModulesService,
    settingService: SettingService,
    unitRichNoteService: UnitRichNoteService,
    unitDownloadSettings: UnitDownloadSettingsDto,
    exportFormat: 'xml' | 'json' = 'xml'
  ): Promise<Buffer> {
    const zip = new AdmZip();
    const unitsMetadata: UnitPropertiesDto[] = [];
    const usedPlayers: string[] = [];
    const exportReport: ExportReportMessage[] = [];
    const unitExportConfig = await UnitDownloadClass.getUnitExportConfig(settingService);

    await Promise.all(
      unitDownloadSettings.unitIdList.map(async unitId => {
        if (exportFormat === 'json') {
          await UnitJsonDownloadClass.getUnitDataJSON(
            unitService,
            unitDefinitionService,
            unitCommentService,
            unitId,
            workspaceId,
            unitDownloadSettings,
            unitRichNoteService,
            unitsMetadata,
            usedPlayers,
            zip,
            exportReport
          );
        } else {
          await UnitXmlDownloadClass.getUnitData(
            unitService,
            unitMetadataService,
            unitDefinitionService,
            unitCommentService,
            unitId,
            workspaceId,
            unitDownloadSettings,
            unitExportConfig,
            unitRichNoteService,
            unitsMetadata,
            usedPlayers,
            zip
          );
        }
      })
    );

    if (unitDownloadSettings.addPlayers) {
      await UnitDownloadClass.addPlayers(veronaModuleService, zip, usedPlayers);
    }

    const loginCount =
      unitDownloadSettings.addTestTakersHot +
      unitDownloadSettings.addTestTakersMonitor +
      unitDownloadSettings.addTestTakersReview;
    // The testcenter reads units only as XML: beside JSON units a booklet would name units it cannot find.
    if (loginCount > 0 && exportFormat === 'xml') {
      BookletDownloadClass.addBooklet(
        unitExportConfig,
        unitDownloadSettings,
        unitsMetadata,
        zip
      );
      BookletDownloadClass.addTestTakers(
        unitExportConfig,
        unitDownloadSettings,
        loginCount,
        zip
      );
    }
    if (exportReport.length) {
      exportReport.sort((a, b) => a.unitKey.localeCompare(b.unitKey));
      zip.addFile(EXPORT_REPORT_FILENAME, Buffer.from(JSON.stringify({ messages: exportReport }, null, 2)));
    }
    return zip.toBuffer();
  }

  static async getUnitExportConfig(
    settingService: SettingService
  ): Promise<UnitExportConfigDto> {
    const unitExportConfig = new UnitExportConfigDto();
    const unitExportConfigFromDB = await settingService.findUnitExportConfig();

    if (unitExportConfigFromDB) {
      if (unitExportConfigFromDB.unitXsdUrl) unitExportConfig.unitXsdUrl = unitExportConfigFromDB.unitXsdUrl;
      if (unitExportConfigFromDB.bookletXsdUrl) unitExportConfig.bookletXsdUrl = unitExportConfigFromDB.bookletXsdUrl;
      if (unitExportConfigFromDB.testTakersXsdUrl) {
        unitExportConfig.testTakersXsdUrl =
          unitExportConfigFromDB.testTakersXsdUrl;
      }
    }
    return unitExportConfig;
  }

  static async addPlayers(
    veronaModuleService: VeronaModulesService,
    zip: AdmZip,
    usedPlayers: string[]
  ): Promise<void> {
    const allPlayers: VeronaModuleInListDto[] =
      await veronaModuleService.findAll('PLAYER');
    const veronaKeyList = new VeronaModuleKeyCollection(
      allPlayers.map(p => p.key)
    );
    const addedPlayers: string[] = [];
    await Promise.all(
      usedPlayers.map(async p => {
        if (addedPlayers.indexOf(p) < 0) {
          const bestMatch = veronaKeyList.getBestMatch(p);
          if (bestMatch && addedPlayers.indexOf(bestMatch) < 0) {
            const playerData: VeronaModuleFileDto =
              await veronaModuleService.findFileById(bestMatch);
            zip.addFile(playerData.fileName, Buffer.from(playerData.file));
            addedPlayers.push(bestMatch);
          }
        }
      })
    );
  }
}
