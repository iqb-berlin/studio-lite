import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequestReportDto } from '@studio-lite-lib/api-dto';
// adm-zip is CommonJS with no statically detectable named exports: under ESM `import * as AdmZip`
// gives a namespace object that is not the class and has none of its members. The default import
// works in both.
import AdmZip from 'adm-zip';
import { VariableInfo } from '@iqbspecs/variable-info/variable-info.interface';
import Workspace from '../entities/workspace.entity';
import { FileIo } from '../interfaces/file-io.interface';
import { UnitImportData } from '../classes/unit-import-data.class';
import { NotAUnitXmlError } from '../exceptions/not-a-unit-xml.error';
import { UnitImportJsonData } from '../classes/unit-import-json-data.class';
import { UnitService } from './unit.service';
import { UnitMetadataService } from './unit-metadata.service';
import { UnitDefinitionService } from './unit-definition.service';
import { UnitCommentService } from './unit-comment.service';
import { UnitRichNoteService } from './unit-rich-note.service';
import User from '../entities/user.entity';
import { ItemUuidLookup } from '../interfaces/item-uuid-lookup.interface';
import { ZIP_MIME_TYPES } from '../constants/zip-mime-types';
import { EXPORT_REPORT_FILENAME, UnitItemJson } from '../interfaces/unit-json-specs.interface';
import { isCodingScheme } from '../utils/coding-scheme';

import {
  ImportedComment,
  mapImportedComment,
  mapImportedItems,
  mapImportedMetadata,
  mapImportedVariables,
  parseCompanionJson
} from '../utils/import-companion-files';

/**
 * Importing units into a workspace from uploaded files: unit XML or JSON index files, the files they
 * name beside them, and zips of all of these. Each unit is created and then filled -- properties,
 * definition, scheme, metadata and items, comments, rich notes -- and every problem with a file
 * becomes a message in the report rather than an error that stops the upload.
 */
@Injectable()
export class WorkspaceImportService {
  constructor(
    @InjectRepository(Workspace)
    private workspacesRepository: Repository<Workspace>,
    private unitService: UnitService,
    private unitMetadataService: UnitMetadataService,
    private unitDefinitionService: UnitDefinitionService,
    private unitCommentService: UnitCommentService,
    private unitRichNoteService: UnitRichNoteService
  ) {}

  async uploadFiles(
    workspaceId: number,
    originalFiles: FileIo[],
    user: User
  ): Promise<RequestReportDto> {
    const functionReturn: RequestReportDto = {
      source: 'upload-units',
      messages: []
    };
    const files = WorkspaceImportService.getZippedFiles(
      originalFiles,
      functionReturn
    );

    const { unitData, notXmlFiles, usedFiles } =
      WorkspaceImportService.readImportData(files, functionReturn);

    await Promise.all(
      unitData.map(async u => {
        await this.uploadFile(
          usedFiles,
          u,
          workspaceId,
          user,
          functionReturn,
          notXmlFiles
        );
      })
    );

    files.forEach(f => {
      if (usedFiles.indexOf(f.originalname) < 0) {
        functionReturn.messages.push({
          objectKey: f.originalname,
          messageKey: 'unit-upload.api-warning.ignore-file'
        });
      }
    });
    return functionReturn;
  }

  private static readImportData(
    files: FileIo[],
    functionReturn: RequestReportDto
  ): {
    unitData: (UnitImportData | UnitImportJsonData)[];
    notXmlFiles: { [fName: string]: FileIo };
    usedFiles: string[];
  } {
    const processedKeys = new Set<string>();
    const unitData: (UnitImportData | UnitImportJsonData)[] = [];
    const notXmlFiles: { [fName: string]: FileIo } = {};
    const usedFiles: string[] = [];
    const xmlCandidates: UnitImportData[] = [];

    files.forEach(f => {
      if (f.mimetype === 'application/json') {
        // the export report file is informational output of the JSON export;
        // silently accept it instead of flagging it as a broken unit file
        if (f.originalname === EXPORT_REPORT_FILENAME ||
          f.originalname.endsWith(`/${EXPORT_REPORT_FILENAME}`)) {
          usedFiles.push(f.originalname);
          return;
        }
        // Only the unit index shape is recognized here. Every other JSON file
        // becomes a lookup candidate regardless of its name: the index decides
        // what is a companion file, so spec-conform exports of third-party
        // systems (arbitrary companion names) import cleanly. Broken referenced
        // files are reported by parseCompanionJson; files no unit references
        // fall into the final ignore-file check.
        try {
          const parsed = JSON.parse(f.buffer.toString()) as Record<string, unknown>;
          if (parsed.id && parsed.userInterface) {
            const jsonData = new UnitImportJsonData(f);
            unitData.push(jsonData);
            processedKeys.add(jsonData.key);
          } else {
            notXmlFiles[f.originalname] = f;
          }
        } catch {
          notXmlFiles[f.originalname] = f;
        }
      } else if (f.mimetype === 'text/xml') {
        try {
          xmlCandidates.push(new UnitImportData(f));
        } catch (error) {
          if (!(error instanceof NotAUnitXmlError && error.isTestcenterFile)) {
            functionReturn.messages.push({
              objectKey: f.originalname,
              messageKey: 'unit-upload.api-warning.xml-parse'
            });
          }
          usedFiles.push(f.originalname);
        }
      } else {
        notXmlFiles[f.originalname] = f;
      }
    });

    xmlCandidates.forEach(xmlData => {
      if (processedKeys.has(xmlData.key)) {
        usedFiles.push(xmlData.fileName);
      } else {
        unitData.push(xmlData);
        processedKeys.add(xmlData.key);
      }
    });

    return { unitData, notXmlFiles, usedFiles };
  }

  private async uploadFile(
    usedFiles: string[],
    unitImportData: UnitImportData | UnitImportJsonData,
    workspaceId: number,
    user: User,
    functionReturn: RequestReportDto,
    notXmlFiles: { [fName: string]: FileIo }
  ) {
    usedFiles.push(unitImportData.fileName);
    const newUnitId = await this.unitService.create(
      workspaceId,
      { key: unitImportData.key, name: unitImportData.name },
      user,
      true
    );
    if (newUnitId > 0) {
      if (unitImportData.uuid) {
        await this.unitService.adoptUuidIfFree(newUnitId, unitImportData.uuid);
      }

      if (unitImportData.variablesFileName) {
        if (notXmlFiles[unitImportData.variablesFileName]) {
          const variablesData = parseCompanionJson<{ baseVariables?: VariableInfo[] }>(
            notXmlFiles[unitImportData.variablesFileName], functionReturn
          );
          if (variablesData) unitImportData.baseVariables = mapImportedVariables(variablesData.baseVariables);
          usedFiles.push(unitImportData.variablesFileName);
        } else {
          WorkspaceImportService.warnMissingFile(unitImportData.variablesFileName, functionReturn);
        }
      }

      if (unitImportData.definitionFileName) {
        if (notXmlFiles[unitImportData.definitionFileName]) {
          unitImportData.definition =
            notXmlFiles[unitImportData.definitionFileName].buffer.toString();
          usedFiles.push(unitImportData.definitionFileName);
          if (unitImportData.definition || unitImportData.lastChangedDefinition) {
            await this.importDefinition(newUnitId, unitImportData);
          }
        } else {
          WorkspaceImportService.warnMissingFile(unitImportData.definitionFileName, functionReturn);
        }
      } else if (unitImportData.definition || unitImportData.lastChangedDefinition) {
        // An inline definition (`<Definition>` in the XML, `isDefinitionInline` in the JSON index) has
        // no file of its own, but is stored the same way, with its variables (#1839).
        await this.importDefinition(newUnitId, unitImportData);
      }

      if (unitImportData.metadataFileName) {
        if (notXmlFiles[unitImportData.metadataFileName]) {
          const parsedMetadata = parseCompanionJson<unknown>(
            notXmlFiles[unitImportData.metadataFileName], functionReturn
          );
          if (parsedMetadata !== undefined) {
            unitImportData.metadata = mapImportedMetadata(parsedMetadata);
          }
          usedFiles.push(unitImportData.metadataFileName);
        } else {
          WorkspaceImportService.warnMissingFile(unitImportData.metadataFileName, functionReturn);
        }
      }

      if (unitImportData.itemsFileName) {
        if (notXmlFiles[unitImportData.itemsFileName]) {
          const parsedItems = parseCompanionJson<UnitItemJson[]>(
            notXmlFiles[unitImportData.itemsFileName], functionReturn
          );
          if (parsedItems !== undefined) {
            // the items file is the authority on items: an empty list also
            // overrides items embedded in a legacy metadata blob
            unitImportData.metadata = {
              ...(unitImportData.metadata ?? {}),
              items: mapImportedItems(parsedItems)
            };
          }
          usedFiles.push(unitImportData.itemsFileName);
        } else {
          WorkspaceImportService.warnMissingFile(unitImportData.itemsFileName, functionReturn);
        }
      }

      const itemUuidLookups = await this.importUnitProperties(
        workspaceId,
        newUnitId,
        unitImportData
      );

      if (unitImportData.commentsFileName) {
        if (notXmlFiles[unitImportData.commentsFileName]) {
          const comments = parseCompanionJson<ImportedComment[]>(
            notXmlFiles[unitImportData.commentsFileName], functionReturn
          );
          usedFiles.push(unitImportData.commentsFileName);
          if (comments) await this.importComments(newUnitId, comments, itemUuidLookups);
        } else {
          WorkspaceImportService.warnMissingFile(unitImportData.commentsFileName, functionReturn);
        }
      }

      if (unitImportData.richNotesFileName) {
        if (notXmlFiles[unitImportData.richNotesFileName]) {
          const richNotes = parseCompanionJson<Record<string, unknown>[]>(
            notXmlFiles[unitImportData.richNotesFileName], functionReturn
          );
          usedFiles.push(unitImportData.richNotesFileName);
          if (richNotes) {
            await this.unitRichNoteService.importNotes(richNotes, newUnitId, itemUuidLookups);
          }
        } else {
          WorkspaceImportService.warnMissingFile(unitImportData.richNotesFileName, functionReturn);
        }
      }

      if (unitImportData.codingSchemeFileName) {
        if (notXmlFiles[unitImportData.codingSchemeFileName]) {
          unitImportData.codingScheme =
            notXmlFiles[unitImportData.codingSchemeFileName].buffer.toString();
          usedFiles.push(unitImportData.codingSchemeFileName);
          if (isCodingScheme(unitImportData.codingScheme)) {
            await this.importScheme(newUnitId, unitImportData);
          } else {
            // The scheme endpoint refuses it, and its error would fail the whole upload (#1986)
            functionReturn.messages.push({
              objectKey: unitImportData.codingSchemeFileName,
              messageKey: 'unit-upload.api-warning.coding-scheme'
            });
          }
        } else {
          WorkspaceImportService.warnMissingFile(unitImportData.codingSchemeFileName, functionReturn);
        }
      }
    } else {
      functionReturn.messages.push({
        objectKey: unitImportData.fileName,
        messageKey: 'unit-patch.duplicate-unit-id'
      });
    }
  }

  private static warnMissingFile(fileName: string, functionReturn: RequestReportDto): void {
    functionReturn.messages.push({
      objectKey: fileName,
      messageKey: 'unit-upload.api-warning.missing-file'
    });
  }

  private static getZippedFiles(
    originalFiles: FileIo[],
    functionReturn: RequestReportDto
  ): FileIo[] {
    const files: FileIo[] = [];
    originalFiles.forEach(f => {
      if (ZIP_MIME_TYPES.indexOf(f.mimetype) >= 0) {
        try {
          const zip = new AdmZip(f.buffer);
          const zipEntries = zip.getEntries();
          zipEntries.forEach(zipEntry => {
            const isXmlFile = /\.xml$/i.test(zipEntry.entryName);
            const isJsonFile = /\.json$/i.test(zipEntry.entryName);
            const fileContent = zipEntry.getData();
            files.push({
              originalname: `${f.originalname}/${zipEntry.entryName}`,
              // eslint-disable-next-line no-nested-ternary
              mimetype: isXmlFile ? 'text/xml' : isJsonFile ? 'application/json' : 'application/octet-stream',
              fieldname: f.fieldname,
              encoding: f.encoding,
              buffer: fileContent,
              size: fileContent.length
            });
          });
        } catch {
          functionReturn.messages.push({
            objectKey: f.originalname,
            messageKey: 'unit-upload.api-error.zip'
          });
        }
      } else {
        files.push(f);
      }
    });
    return files;
  }

  private async importUnitProperties(
    workspaceId: number,
    newUnitId: number,
    unitImportData: UnitImportData | UnitImportJsonData
  ): Promise<ItemUuidLookup[]> {
    let itemUuidLookups: ItemUuidLookup[] = [];
    await this.unitService.patchUnitProperties(
      newUnitId,
      {
        id: newUnitId,
        editor: unitImportData.editor,
        player: unitImportData.player,
        schemer: unitImportData.schemer,
        description: unitImportData.description,
        transcript: unitImportData.transcript,
        lastChangedMetadata: unitImportData.lastChangedMetadata,
        lastChangedDefinition: unitImportData.lastChangedDefinition,
        lastChangedScheme: unitImportData.lastChangedScheme,
        lastChangedMetadataUser: unitImportData.lastChangedMetadataUser,
        lastChangedDefinitionUser: unitImportData.lastChangedDefinitionUser,
        lastChangedSchemeUser: unitImportData.lastChangedSchemeUser
      },
      null
    );
    if (unitImportData.metadata) {
      const workspace = await this.workspacesRepository.findOne({
        where: { id: workspaceId }
      });
      const metadata = UnitMetadataService.setCurrentProfiles(
        workspace.settings?.unitMDProfile,
        workspace.settings?.itemMDProfile,
        unitImportData.metadata
      );
      itemUuidLookups = await this.unitMetadataService.copyItemsWithMetadata(
        newUnitId,
        metadata
      );
    }
    return itemUuidLookups;
  }

  private async importDefinition(
    newUnitId: number,
    unitImportData: UnitImportData | UnitImportJsonData
  ) {
    await this.unitDefinitionService.patchDefinition(
      newUnitId,
      {
        definition: unitImportData.definition,
        definitionType: unitImportData.definitionType,
        variables: unitImportData.baseVariables
      },
      null,
      unitImportData.lastChangedDefinition
    );
  }

  private async importScheme(
    newUnitId: number,
    unitImportData: UnitImportData | UnitImportJsonData
  ) {
    await this.unitDefinitionService.patchScheme(
      newUnitId,
      {
        scheme: unitImportData.codingScheme,
        schemeType: unitImportData.schemeType
      },
      null,
      unitImportData.lastChangedScheme
    );
  }

  private async importComments(
    unitId: number,
    comments: ImportedComment[],
    itemUuidLookups: ItemUuidLookup[]
  ) {
    const mappedComments = comments.map(c => mapImportedComment(c));
    await this.unitCommentService.createComments(
      mappedComments,
      unitId,
      itemUuidLookups
    );
  }
}
