import {
  ItemsMetadataValues,
  MetadataValues,
  MetadataValuesEntry,
  UnitCommentDto,
  UnitDefinitionDto,
  UnitDownloadSettingsDto,
  UnitExportConfigDto,
  UnitPropertiesDto,
  UnitRichNoteDto,
  UnitRichNoteLinkDto,
  UnitRichNoteTagDto,
  UnitSchemeDto,
  VeronaModuleFileDto,
  VeronaModuleInListDto
} from '@studio-lite-lib/api-dto';
import * as AdmZip from 'adm-zip';
import * as XmlBuilder from 'xmlbuilder2';
import { VeronaModuleKeyCollection } from '@studio-lite/shared-code';
import { XMLBuilder } from 'xmlbuilder2/lib/interfaces';
import {
  CodingSchemeData,
  VariableCodingData
} from '@iqbspecs/coding-scheme/coding-scheme.interface';
import { VariableInfo } from '@iqbspecs/variable-info/variable-info.interface';
import { UnitService } from '../services/unit.service';
import {
  LanguageCodedText,
  MetadataValueJson,
  MetadataValuesJson,
  UnitItemJson,
  UnitMetadataJson
} from '../interfaces/unit-json-specs.interface';
import { VeronaModulesService } from '../services/verona-modules.service';
import { SettingService } from '../services/setting.service';
import { UnitCommentService } from '../services/unit-comment.service';
import { UnitRichNoteService } from '../services/unit-rich-note.service';

interface ExternalDataBlock {
  id: string;
  type: string;
  modifiedAt?: string;
}

interface UserInterfaceBlock {
  player: string;
  editor?: string;
  definition?: string;
  isDefinitionInline?: boolean;
  modifiedAt?: string;
}

// Comment shape as defined by the iqb unit-comments@0.1 specification
// (https://iqb-specifications.github.io/unit-comments/). Fields without a
// counterpart in the spec are intentionally dropped on export.
interface UnitCommentJson {
  id: number;
  body: string;
  commentator?: string;
  parentComment?: number;
  isHidden?: boolean;
  createdAt?: string;
  changedAt?: string;
  itemUuids?: string[];
}

// Rich note shape as defined by the iqb unit-rich-notes@0.2 specification
// (https://github.com/iqb-specifications/unit-rich-notes). links and itemUuids
// have minItems: 1, so they must be omitted rather than emitted empty.
interface UnitRichNoteJson {
  tagId: string;
  tagLabel?: string;
  content: string;
  links?: UnitRichNoteLinkDto[];
  itemUuids?: string[];
}

interface UnitIndexJson {
  id: string;
  uuid?: string;
  modifiedAt?: string;
  label?: string;
  description?: string;
  userInterface: UserInterfaceBlock;
  codingScheme?: ExternalDataBlock;
  comments?: ExternalDataBlock;
  richNotes?: ExternalDataBlock;
  metadata?: ExternalDataBlock;
  items?: ExternalDataBlock;
  variables?: ExternalDataBlock;
}

// A message of the export-report.json that is added to a JSON export zip
// when mapping internal data onto the iqb spec shapes had to drop content.
// The file is only written when at least one message exists; the import
// recognizes it by name and skips it.
export interface ExportReportMessage {
  unitKey: string;
  objectKey: string;
  messageKey: string;
  details?: Record<string, string>;
}

// Scope handed down through the spec transforms so dropped content can be
// reported against the unit and target file it would have belonged to.
interface ExportReportScope {
  unitKey: string;
  objectKey: string;
  messages: ExportReportMessage[];
  profileId?: string;
}

export class UnitDownloadClass {
  static async get(
    workspaceId: number,
    unitService: UnitService,
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
    const unitExportConfig = exportFormat === 'xml' ?
      await UnitDownloadClass.getUnitExportConfig(settingService) :
      new UnitExportConfigDto();

    await Promise.all(
      unitDownloadSettings.unitIdList.map(async unitId => {
        if (exportFormat === 'json') {
          await UnitDownloadClass.getUnitDataJSON(
            unitService,
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
          await UnitDownloadClass.getUnitData(
            unitService,
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
    if (loginCount > 0) {
      UnitDownloadClass.addBooklet(
        unitExportConfig,
        unitDownloadSettings,
        unitsMetadata,
        zip
      );
      UnitDownloadClass.addTestTakers(
        unitExportConfig,
        unitDownloadSettings,
        loginCount,
        zip
      );
    }
    if (exportReport.length) {
      exportReport.sort((a, b) => a.unitKey.localeCompare(b.unitKey));
      zip.addFile('export-report.json', Buffer.from(JSON.stringify({ messages: exportReport }, null, 2)));
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

  static async getUnitData(
    unitService: UnitService,
    unitCommentService: UnitCommentService,
    unitId: number,
    workspaceId: number,
    unitDownloadSettings: UnitDownloadSettingsDto,
    unitExportConfig: UnitExportConfigDto,
    unitRichNoteService: UnitRichNoteService,
    unitsMetadata: UnitPropertiesDto[],
    usedPlayers: string[],
    zip: AdmZip
  ): Promise<void> {
    const unitMetadata = await unitService.findOnesProperties(
      unitId,
      workspaceId
    );
    const unitXml = UnitDownloadClass.createUnitXML(
      unitExportConfig,
      unitMetadata
    );
    UnitDownloadClass.addMetadata(unitMetadata, zip);
    const definitionData = await unitService.findOnesDefinition(unitId);
    UnitDownloadClass.addUnitDefinition(
      definitionData,
      unitXml,
      unitMetadata,
      zip
    );
    UnitDownloadClass.addVariables(definitionData, unitXml);
    if (unitDownloadSettings.addComments) {
      const comments = await unitCommentService.findOnesComments(unitId);
      UnitDownloadClass.addComments(comments, unitXml, unitMetadata, zip);
    }
    const schemeData = await unitService.findOnesScheme(unitId);
    UnitDownloadClass.addScheme(schemeData, unitXml, unitMetadata, zip);
    UnitDownloadClass.addDerivedVariables(schemeData, unitXml);
    if (unitDownloadSettings.addRichNotes) {
      await UnitDownloadClass.addRichNotes(
        unitRichNoteService,
        unitId,
        unitXml,
        unitMetadata,
        zip
      );
    }
    zip.addFile(
      `${unitMetadata.key}.xml`,
      Buffer.from(unitXml.toString({ prettyPrint: true }))
    );
    unitsMetadata.push(unitMetadata);
    if (usedPlayers.indexOf(unitMetadata.player) < 0) usedPlayers.push(unitMetadata.player);
  }

  static createUnitXML(
    unitExportConfig: UnitExportConfigDto,
    unitMetadata: UnitPropertiesDto
  ): XMLBuilder {
    return XmlBuilder.create(
      { version: '1.0' },
      {
        Unit: {
          '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
          '@xsi:noNamespaceSchemaLocation': unitExportConfig.unitXsdUrl,
          Metadata: {
            '@lastChange': unitMetadata.lastChangedMetadata?.toISOString(),
            Id: unitMetadata.key,
            Label: unitMetadata.name,
            Description: unitMetadata.description,
            Reference:
              Object.keys(unitMetadata.metadata).length !== 0 ?
                `${unitMetadata.key}.vomd` :
                ''
          }
        }
      }
    );
  }

  static addMetadata(
    unitMetadata: UnitPropertiesDto,
    zip: AdmZip
  ): void {
    if (Object.keys(unitMetadata.metadata).length !== 0) {
      zip.addFile(
        `${unitMetadata.key}.vomd`,
        Buffer.from(JSON.stringify(unitMetadata.metadata))
      );
    }
  }

  static addUnitDefinition(
    definitionData: UnitDefinitionDto,
    unitXml: XMLBuilder,
    unitMetadata: UnitPropertiesDto,
    zip: AdmZip
  ): void {
    if (definitionData?.definition?.length > 0) {
      unitXml.root().ele({
        DefinitionRef: {
          '@player': unitMetadata.player || '',
          '@editor': unitMetadata.editor || '',
          ...(unitMetadata.lastChangedDefinition && {
            '@lastChange': unitMetadata.lastChangedDefinition.toISOString()
          }),
          '#': `${unitMetadata.key}.voud`
        }
      });
      zip.addFile(
        `${unitMetadata.key}.voud`,
        Buffer.from(definitionData.definition)
      );
    } else {
      unitXml.root().ele({
        Definition: {
          '@player': unitMetadata.player || '',
          '@editor': unitMetadata.editor || '',
          ...(unitMetadata.lastChangedDefinition && {
            '@lastChange': unitMetadata.lastChangedDefinition.toISOString()
          })
        }
      });
    }
  }

  static addVariables(
    definitionData: UnitDefinitionDto,
    unitXml: XMLBuilder
  ): void {
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
        if (
          transformedVariable.valuePositionLabels &&
          transformedVariable.valuePositionLabels.length
        ) {
          const valuePositionLabelsElement = variableElement.ele(
            'ValuePositionLabels'
          );
          transformedVariable.valuePositionLabels.forEach(label => {
            valuePositionLabelsElement.ele({
              ValuePositionLabel: { '#': label }
            });
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

  static getDerivedVariableType(coding: VariableCodingData): string {
    switch (coding.sourceType) {
      case 'SUM_CODE':
      case 'SUM_SCORE':
      case 'COPY_VALUE':
        return 'integer';
      case 'SOLVER':
        return 'number';
      case 'UNIQUE_VALUES':
        return 'boolean';
      case 'CONCAT_CODE':
      case 'MANUAL':
      default:
        return 'string';
    }
  }

  static parseDerivedCodings(schemeData: UnitSchemeDto): VariableCodingData[] {
    if (!schemeData?.scheme) return [];
    let codingScheme: CodingSchemeData;
    try {
      codingScheme = JSON.parse(schemeData.scheme) as CodingSchemeData;
    } catch {
      return [];
    }
    return codingScheme?.variableCodings?.filter(
      vc => vc.sourceType !== 'BASE' && vc.sourceType !== 'BASE_NO_VALUE'
    ) ?? [];
  }

  static addDerivedVariables(
    schemeData: UnitSchemeDto,
    unitXml: XMLBuilder
  ): void {
    const derivedCodings = UnitDownloadClass.parseDerivedCodings(schemeData);
    if (derivedCodings.length === 0) return;
    const derivedVariablesElement = unitXml.root().ele('DerivedVariables');
    derivedCodings.forEach(coding => {
      derivedVariablesElement.ele({
        Variable: {
          '@id': coding.alias || coding.id,
          '@type': UnitDownloadClass.getDerivedVariableType(coding),
          '@format': '',
          '@nullable': false,
          '@multiple': false,
          ...(coding.page && { '@page': coding.page })
        }
      });
    });
  }

  static addComments(
    comments: UnitCommentDto[],
    unitXml: XMLBuilder,
    unitMetadata: UnitPropertiesDto,
    zip: AdmZip
  ): void {
    if (comments && comments.length) {
      unitXml.root().ele({
        UnitCommentsRef: {
          '#': `${unitMetadata.key}.vouc`
        }
      });
      zip.addFile(
        `${unitMetadata.key}.vouc`,
        Buffer.from(JSON.stringify(comments))
      );
    }
  }

  static addScheme(
    schemeData: UnitSchemeDto,
    unitXml: XMLBuilder,
    unitMetadata: UnitPropertiesDto,
    zip: AdmZip
  ): void {
    if (schemeData?.scheme) {
      zip.addFile(`${unitMetadata.key}.vocs`, Buffer.from(schemeData.scheme));
    }

    if (unitMetadata?.schemer) {
      unitXml.root().ele({
        CodingSchemeRef: {
          '@schemer': unitMetadata.schemer,
          ...(unitMetadata.schemeType && {
            '@schemeType': unitMetadata.schemeType
          }),
          ...(unitMetadata.lastChangedScheme && {
            '@lastChange': unitMetadata.lastChangedScheme.toISOString()
          }),
          ...(schemeData?.scheme && { '#': `${unitMetadata.key}.vocs` })
        }
      });
    }
  }

  static findTag(
    tags: UnitRichNoteTagDto[],
    tagId: string
  ): UnitRichNoteTagDto | null {
    if (!tagId) return null;

    const findTagRecursive = (
      currentTags: UnitRichNoteTagDto[]
    ): UnitRichNoteTagDto | undefined => {
      let found: UnitRichNoteTagDto | undefined = currentTags.find(
        tag => tag.id === tagId || tag.id.endsWith(`#${tagId}`)
      );
      if (!found) {
        currentTags.forEach(tag => {
          if (!found && tag.children?.length) {
            found = findTagRecursive(tag.children);
          }
        });
      }
      return found;
    };

    const foundTag = findTagRecursive(tags);
    if (foundTag) return foundTag;

    return tagId.split('.').reduce<{
      tags: UnitRichNoteTagDto[];
      tag: UnitRichNoteTagDto | null;
    }>(
      (acc, segment) => {
        const found = acc.tags.find(t => t.id === segment || t.id.endsWith(`#${segment}`));
        return {
          tags: found?.children || [],
          tag: found || null
        };
      },
      { tags, tag: null }
    ).tag;
  }

  static getLabelString(
    labels: { lang: string; value: string }[] | null | undefined
  ): string | null {
    if (!labels || labels.length === 0) return null;
    const de = labels.find(l => l.lang === 'de');
    if (de) return de.value;
    const en = labels.find(l => l.lang === 'en');
    if (en) return en.value;
    return labels[0].value;
  }

  // Maps internal rich note DTOs onto the iqb unit-rich-notes@0.2 spec shape.
  // links and itemUuids are only emitted when non-empty: the spec requires
  // minItems: 1, so an empty/null array would make the file schema-invalid.
  static transformRichNotes(
    notes: UnitRichNoteDto[],
    tags: UnitRichNoteTagDto[]
  ): UnitRichNoteJson[] {
    return notes.map(note => {
      const tag = UnitDownloadClass.findTag(tags, note.tagId);
      const transformed: UnitRichNoteJson = {
        tagId: tag ? tag.id : note.tagId,
        content: note.content
      };
      const tagLabel = UnitDownloadClass.getLabelString(tag?.label);
      if (tagLabel) transformed.tagLabel = tagLabel;
      if (note.links?.length) transformed.links = note.links;
      if (note.itemReferences?.length) transformed.itemUuids = note.itemReferences;
      return transformed;
    });
  }

  // Maps internal comment DTOs onto the iqb unit-comments@0.1 spec shape.
  // userId/unitId/upVotes/downVotes/userVote have no spec counterpart and are
  // dropped without information loss: they are overwritten or ignored on import.
  static transformComments(comments: UnitCommentDto[]): UnitCommentJson[] {
    return comments.map(comment => {
      const transformed: UnitCommentJson = {
        id: comment.id,
        body: comment.body
      };
      if (comment.userName) transformed.commentator = comment.userName;
      if (comment.parentId !== null && comment.parentId !== undefined) {
        transformed.parentComment = comment.parentId;
      }
      if (comment.hidden) transformed.isHidden = comment.hidden;
      if (comment.createdAt) transformed.createdAt = new Date(comment.createdAt).toISOString();
      if (comment.changedAt) transformed.changedAt = new Date(comment.changedAt).toISOString();
      if (comment.itemUuids?.length) transformed.itemUuids = comment.itemUuids;
      return transformed;
    });
  }

  // Normalizes internal text data (single object or array, e.g. label or
  // valueAsText) to the language_coded_texts shape of metadata-values@3.0.
  // Items without a valid two-letter language code have no spec counterpart
  // (pattern ^[a-z]{2}$) and are dropped; empty lists become undefined since
  // the spec requires minItems: 1.
  static toLanguageCodedTexts(texts: unknown): LanguageCodedText[] | undefined {
    const list = Array.isArray(texts) ? texts : [texts];
    const valid = list
      .filter((text): text is LanguageCodedText => !!text &&
        typeof (text as LanguageCodedText).lang === 'string' &&
        /^[a-z]{2}$/.test((text as LanguageCodedText).lang) &&
        typeof (text as LanguageCodedText).value === 'string')
      .map(text => ({ lang: text.lang, value: text.value }));
    return valid.length ? valid : undefined;
  }

  // True when stored metadata holds content the spec transform cannot carry
  // over: profiles that produced no output, or keys of a pre-profile legacy
  // shape (anything besides profiles/items).
  private static hasUnexportedMetadata(metadata?: { profiles?: MetadataValues[] }): boolean {
    if (!metadata) return false;
    if (metadata.profiles?.length) return true;
    return Object.keys(metadata).some(k => k !== 'profiles' && k !== 'items');
  }

  // Reports a text that carried actual content but was dropped because its
  // language code does not match the spec pattern ^[a-z]{2}$.
  private static reportDroppedTexts(
    texts: unknown, entryId: string, scope?: ExportReportScope
  ): void {
    if (!scope) return;
    const list = Array.isArray(texts) ? texts : [texts];
    list
      .filter(text => !!text &&
        typeof (text as LanguageCodedText).value === 'string' &&
        (text as LanguageCodedText).value !== '' &&
        !(typeof (text as LanguageCodedText).lang === 'string' &&
          /^[a-z]{2}$/.test((text as LanguageCodedText).lang)))
      .forEach(text => scope.messages.push({
        unitKey: scope.unitKey,
        objectKey: scope.objectKey,
        messageKey: 'unit-download.api-warning.invalid-language-code',
        details: {
          ...(scope.profileId && { profileId: scope.profileId }),
          entryId,
          lang: typeof (text as LanguageCodedText).lang === 'string' ? (text as LanguageCodedText).lang : '',
          value: (text as LanguageCodedText).value
        }
      }));
  }

  // Maps an internal entry value onto one of the three value forms of
  // metadata-values@3.0: simple_value (internal plain string plus valueAsText),
  // vocabulary_entries (internal { id, text } lists) or language_coded_texts.
  // Returns undefined for empty values since the spec requires `value`.
  static transformEntryValue(entry: MetadataValuesEntry, scope?: ExportReportScope): MetadataValueJson | undefined {
    const { value } = entry;
    if (typeof value === 'string') {
      if (!value) return undefined;
      const asText = UnitDownloadClass.toLanguageCodedTexts(entry.valueAsText);
      return { raw: value, ...(asText && { asText }) };
    }
    if (Array.isArray(value) && value.length) {
      const vocabularyEntries = value
        .filter(entryValue => !!entryValue && typeof (entryValue as { id?: unknown }).id === 'string')
        .map(entryValue => {
          const vocabularyEntry = entryValue as { id: string; text?: unknown };
          UnitDownloadClass.reportDroppedTexts(vocabularyEntry.text, entry.id, scope);
          const label = UnitDownloadClass.toLanguageCodedTexts(vocabularyEntry.text);
          return {
            id: vocabularyEntry.id,
            ...(label && { label })
          };
        });
      if (vocabularyEntries.length) {
        const presentValues = value.filter(entryValue => !!entryValue).length;
        if (scope && vocabularyEntries.length < presentValues) {
          scope.messages.push({
            unitKey: scope.unitKey,
            objectKey: scope.objectKey,
            messageKey: 'unit-download.api-warning.mixed-value-dropped',
            details: {
              ...(scope.profileId && { profileId: scope.profileId }),
              entryId: entry.id,
              droppedCount: String(presentValues - vocabularyEntries.length)
            }
          });
        }
        return vocabularyEntries;
      }
      UnitDownloadClass.reportDroppedTexts(value, entry.id, scope);
      return UnitDownloadClass.toLanguageCodedTexts(value);
    }
    return undefined;
  }

  // Maps internal profile values onto metadata-values@3.0. Internal-only
  // fields (isCurrent, valueAsText) are dropped; profiles without profileId
  // or without any exportable entry are omitted since the spec requires
  // profileId and entries with minItems: 1.
  static transformProfilesToMetadataValues(
    profiles?: MetadataValues[], scope?: ExportReportScope
  ): MetadataValuesJson[] {
    return (profiles ?? []).flatMap(profile => {
      if (!profile?.profileId) {
        if (scope && profile?.entries?.length) {
          scope.messages.push({
            unitKey: scope.unitKey,
            objectKey: scope.objectKey,
            messageKey: 'unit-download.api-warning.profile-not-exported',
            details: { entryCount: String(profile.entries.length) }
          });
        }
        return [];
      }
      const profileScope = scope && { ...scope, profileId: profile.profileId };
      const entries = (profile.entries ?? []).flatMap(entry => {
        if (!entry?.id) return [];
        const value = UnitDownloadClass.transformEntryValue(entry, profileScope);
        if (!value) return [];
        const label = UnitDownloadClass.toLanguageCodedTexts(entry.label);
        return [{ id: entry.id, ...(label && { label }), value }];
      });
      if (!entries.length) return [];
      return [{ profileId: profile.profileId, entries }];
    });
  }

  // Maps internal item data onto the iqb unit-items@0.2 spec shape:
  // variableId/variableReadOnlyId become sourceVariableId/sourceVariableUuid;
  // position/locked/unitId/weighting have no spec counterpart and are
  // dropped. Items without the required id are skipped.
  static transformItems(items?: ItemsMetadataValues[], scope?: ExportReportScope): UnitItemJson[] {
    return (items ?? []).flatMap((item, itemIndex) => {
      if (!item?.id) {
        if (scope && item) {
          scope.messages.push({
            unitKey: scope.unitKey,
            objectKey: scope.objectKey,
            messageKey: 'unit-download.api-warning.item-not-exported',
            details: { ...(item.uuid && { uuid: item.uuid }) }
          });
        }
        return [];
      }
      const transformed: UnitItemJson = { id: item.id };
      if (item.uuid) transformed.uuid = item.uuid;
      if (item.description) transformed.description = item.description;
      transformed.order = typeof item.order === 'number' ? item.order : itemIndex;
      if (item.variableId) transformed.sourceVariableId = item.variableId;
      if (item.variableReadOnlyId) transformed.sourceVariableUuid = item.variableReadOnlyId;
      if (item.createdAt) transformed.createdAt = new Date(item.createdAt).toISOString();
      if (item.changedAt) transformed.changedAt = new Date(item.changedAt).toISOString();
      const metadata = UnitDownloadClass.transformProfilesToMetadataValues(item.profiles, scope);
      if (metadata.length) transformed.metadata = metadata;
      return [transformed];
    });
  }

  static async addRichNotes(
    unitRichNoteService: UnitRichNoteService,
    unitId: number,
    unitXml: XMLBuilder,
    unitMetadata: UnitPropertiesDto,
    zip: AdmZip
  ): Promise<void> {
    const { notes, tags } = await unitRichNoteService.findNotes(unitId);
    if (notes && notes.length) {
      const transformedNotes = UnitDownloadClass.transformRichNotes(notes, tags);
      const fileName = `${unitMetadata.key}.vorn`;
      unitXml.root().ele({
        UnitRichNotesRef: {
          '#': fileName
        }
      });
      zip.addFile(
        fileName,
        Buffer.from(JSON.stringify(transformedNotes, null, 2))
      );
    }
  }

  static async addPlayers(
    veronaModuleService: VeronaModulesService,
    zip: AdmZip,
    usedPlayers: string[]
  ): Promise<void> {
    const allPlayers: VeronaModuleInListDto[] =
      await veronaModuleService.findAll('player');
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

  static createBookletXml(
    unitExportConfig: UnitExportConfigDto,
    bookletId: string = 'booklet1',
    bookletLabel: string = ''
  ): XMLBuilder {
    return XmlBuilder.create(
      { version: '1.0' },
      {
        Booklet: {
          '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
          '@xsi:noNamespaceSchemaLocation': unitExportConfig.bookletXsdUrl,
          Metadata: {
            Id: bookletId,
            Label: bookletLabel
          }
        }
      }
    );
  }

  static safeBookletId(raw: string | undefined): string {
    return (raw || 'booklet1').replace(/[^A-Za-z0-9_-]/g, '_');
  }

  static addBooklet(
    unitExportConfig: UnitExportConfigDto,
    unitDownloadSettings: UnitDownloadSettingsDto,
    unitsMetadata: UnitPropertiesDto[],
    zip: AdmZip
  ): void {
    const bookletId = UnitDownloadClass.safeBookletId(unitDownloadSettings.bookletId);
    const bookletLabel = unitDownloadSettings.bookletLabel ?? '';
    const bookletXml = UnitDownloadClass.createBookletXml(unitExportConfig, bookletId, bookletLabel);
    const configElement = bookletXml.root().ele('BookletConfig');
    unitDownloadSettings.bookletSettings.forEach(bc => {
      configElement.ele({
        Config: {
          '@key': bc.key,
          '#': bc.value
        }
      });
    });
    const unitsElement = bookletXml.root().ele('Units');
    unitsMetadata.forEach((u, i) => {
      unitsElement.ele({
        Unit: {
          '@id': u.key,
          '@label': u.name || `Aufgabe ${i + 1}`,
          '@labelshort': `${i + 1}`
        }
      });
    });
    zip.addFile(
      `${bookletId}.xml`,
      Buffer.from(bookletXml.toString({ prettyPrint: true }))
    );
  }

  static createTestTakersXml(
    unitExportConfig: UnitExportConfigDto
  ): XMLBuilder {
    return XmlBuilder.create(
      { version: '1.0' },
      {
        Testtakers: {
          '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
          '@xsi:noNamespaceSchemaLocation': unitExportConfig.testTakersXsdUrl,
          Metadata: {}
        }
      }
    );
  }

  static addTestTakers(
    unitExportConfig: UnitExportConfigDto,
    unitDownloadSettings: UnitDownloadSettingsDto,
    loginCount: number,
    zip: AdmZip
  ): void {
    const bookletId = UnitDownloadClass.safeBookletId(unitDownloadSettings.bookletId);
    const testTakerXml =
      UnitDownloadClass.createTestTakersXml(unitExportConfig);
    let codeLen = loginCount > 1000 ? 8 : 5;
    if (unitDownloadSettings.passwordLess) codeLen += 2;
    const loginNames = UnitDownloadClass.generateCodeList(
      codeLen,
      loginCount + 1
    );
    const loginPasswords = unitDownloadSettings.passwordLess ?
      <string[]>[] :
      UnitDownloadClass.generateCodeList(
        loginCount > 1000 ? 5 : 4,
        loginCount
      );
    let loginIndex = 0;
    const groupLabel = unitDownloadSettings.groupLabel ?? '';
    const groupElement = testTakerXml.root().ele({
      Group: {
        '@id': `${bookletId}_group`,
        '@label': groupLabel
      }
    });
    Array.from({ length: unitDownloadSettings.addTestTakersHot }).forEach((_, i) => {
      loginIndex += 1;
      const prefix =
        unitDownloadSettings.addTestTakersMonitor > 0 ?
          `T${(i + 1).toString().padStart(2, '0')}_` :
          '';
      const loginElement = groupElement.ele({
        Login: {
          '@mode': 'run-hot-return',
          '@name': `${prefix}${loginNames[loginIndex]}`
        }
      });
      if (!unitDownloadSettings.passwordLess) loginElement.att('pw', loginPasswords[loginIndex - 1]);
      loginElement.ele({
        Booklet: {
          '#': bookletId
        }
      });
    });
    Array.from({ length: unitDownloadSettings.addTestTakersReview }).forEach(() => {
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
          '#': bookletId
        }
      });
    });
    Array.from({ length: unitDownloadSettings.addTestTakersMonitor }).forEach((_, i) => {
      loginIndex += 1;
      const prefix =
        unitDownloadSettings.addTestTakersMonitor > 1 ?
          `TL${(i + 1).toString().padStart(2, '0')}_` :
          'TL_';
      const loginElement = groupElement.ele({
        Login: {
          '@mode': 'monitor-group',
          '@name': `${prefix}${loginNames[loginIndex]}`
        }
      });
      if (!unitDownloadSettings.passwordLess) loginElement.att('pw', loginPasswords[loginIndex - 1]);
      if (unitDownloadSettings.monitorBookletVisibility) {
        loginElement.ele({
          ViewSettings: {
            monitorBookletVisibility: unitDownloadSettings.monitorBookletVisibility
          }
        });
      }
    });
    zip.addFile(
      `${bookletId}_testtaker.xml`,
      Buffer.from(testTakerXml.toString({ prettyPrint: true }))
    );
  }

  static async getUnitDataJSON(
    unitService: UnitService,
    unitCommentService: UnitCommentService,
    unitId: number,
    workspaceId: number,
    unitDownloadSettings: UnitDownloadSettingsDto,
    unitRichNoteService: UnitRichNoteService,
    unitsMetadata: UnitPropertiesDto[],
    usedPlayers: string[],
    zip: AdmZip,
    exportReport: ExportReportMessage[] = []
  ): Promise<void> {
    const unitMetadata = await unitService.findOnesProperties(unitId, workspaceId);
    const uuid = await unitService.ensureUuid(unitId);
    const key = unitMetadata.key;

    const index: UnitIndexJson = {
      id: key,
      uuid,
      modifiedAt: unitMetadata.lastChangedMetadata?.toISOString(),
      label: unitMetadata.name || undefined,
      description: unitMetadata.description || undefined,
      userInterface: { player: unitMetadata.player || '' }
    };

    const definitionData = await unitService.findOnesDefinition(unitId);
    if (unitMetadata.editor) index.userInterface.editor = unitMetadata.editor;
    if (definitionData?.definition?.length > 0) {
      zip.addFile(`${key}.voud`, Buffer.from(definitionData.definition));
      index.userInterface.definition = `${key}.voud`;
      index.userInterface.isDefinitionInline = false;
    }
    if (unitMetadata.lastChangedDefinition) {
      index.userInterface.modifiedAt = unitMetadata.lastChangedDefinition.toISOString();
    }

    const schemeData = await unitService.findOnesScheme(unitId);
    if (schemeData?.scheme) {
      zip.addFile(`${key}.vocs.json`, Buffer.from(schemeData.scheme));
      index.codingScheme = {
        id: `${key}.vocs.json`,
        type: 'iqb-coding-scheme',
        ...(unitMetadata.lastChangedScheme && { modifiedAt: unitMetadata.lastChangedScheme.toISOString() })
      };
    }

    if (unitDownloadSettings.addComments) {
      const comments = await unitCommentService.findOnesComments(unitId);
      if (comments?.length) {
        const transformedComments = UnitDownloadClass.transformComments(comments);
        zip.addFile(`${key}.voco.json`, Buffer.from(JSON.stringify(transformedComments, null, 2)));
        index.comments = { id: `${key}.voco.json`, type: 'iqb-unit-comments' };
      }
    }

    if (unitDownloadSettings.addRichNotes) {
      const { notes, tags } = await unitRichNoteService.findNotes(unitId);
      if (notes?.length) {
        const transformedNotes = UnitDownloadClass.transformRichNotes(notes, tags);
        zip.addFile(`${key}.vorn.json`, Buffer.from(JSON.stringify(transformedNotes, null, 2)));
        index.richNotes = { id: `${key}.vorn.json`, type: 'iqb-unit-rich-notes' };
      }
    }

    const metadataScope = { unitKey: key, objectKey: `${key}.vomd.json`, messages: exportReport };
    const metadataValues = UnitDownloadClass
      .transformProfilesToMetadataValues(unitMetadata.metadata?.profiles, metadataScope);
    if (metadataValues.length) {
      const unitMetadataJson: UnitMetadataJson = {
        ...(unitMetadata.lastChangedMetadata && { changedAt: unitMetadata.lastChangedMetadata.toISOString() }),
        metadata: metadataValues
      };
      zip.addFile(`${key}.vomd.json`, Buffer.from(JSON.stringify(unitMetadataJson, null, 2)));
      index.metadata = {
        id: `${key}.vomd.json`,
        type: 'unit-metadata@0.1',
        ...(unitMetadata.lastChangedMetadata && { modifiedAt: unitMetadata.lastChangedMetadata.toISOString() })
      };
    } else if (UnitDownloadClass.hasUnexportedMetadata(unitMetadata.metadata)) {
      // stored metadata exists but none of it fits the spec (e.g. a legacy
      // shape without profileId) — before the spec export this was written
      // verbatim, so the omission must not stay silent
      exportReport.push({
        unitKey: key,
        objectKey: `${key}.vomd.json`,
        messageKey: 'unit-download.api-warning.metadata-not-exported'
      });
    }

    const itemsScope = { unitKey: key, objectKey: `${key}.voit.json`, messages: exportReport };
    const items = UnitDownloadClass.transformItems(unitMetadata.metadata?.items, itemsScope);
    if (items.length) {
      zip.addFile(`${key}.voit.json`, Buffer.from(JSON.stringify(items, null, 2)));
      index.items = {
        id: `${key}.voit.json`,
        type: 'unit-items@0.2',
        ...(unitMetadata.lastChangedMetadata && { modifiedAt: unitMetadata.lastChangedMetadata.toISOString() })
      };
    }

    const variables = UnitDownloadClass.buildVariablesJSON(definitionData, schemeData);
    if (variables) {
      zip.addFile(`${key}.vova.json`, Buffer.from(JSON.stringify(variables, null, 2)));
      index.variables = {
        id: `${key}.vova.json`,
        type: 'unit-variables',
        ...(unitMetadata.lastChangedDefinition && { modifiedAt: unitMetadata.lastChangedDefinition.toISOString() })
      };
    }

    zip.addFile(`${key}.json`, Buffer.from(JSON.stringify(index, null, 2)));
    unitsMetadata.push(unitMetadata);
    if (usedPlayers.indexOf(unitMetadata.player) < 0) usedPlayers.push(unitMetadata.player);
  }

  static buildVariablesJSON(
    definitionData: UnitDefinitionDto,
    schemeData: UnitSchemeDto
  ): { baseVariables: VariableInfo[]; derivedVariables: { id: string; basedOn: string[] }[] } | null {
    const baseVariables: VariableInfo[] = definitionData?.variables ?? [];
    const derivedVariables: { id: string; basedOn: string[] }[] = UnitDownloadClass
      .parseDerivedCodings(schemeData)
      .map(coding => ({
        id: coding.alias || coding.id,
        basedOn: coding.deriveSources ?? []
      }));

    if (baseVariables.length === 0 && derivedVariables.length === 0) return null;
    return { baseVariables, derivedVariables };
  }

  static generateCodeList(codeLen: number, codeCount: number): string[] {
    const codeCharacters = 'abcdefghprqstuvxyz';
    const codeNumbers = '2345679';
    return Array.from({ length: codeCount }).reduce<string[]>(list => {
      let newCode = '';
      do {
        newCode = '';
        let isNumber = false;
        do {
          newCode += isNumber ?
            codeNumbers.substr(
              Math.floor(codeNumbers.length * Math.random()),
              1
            ) :
            codeCharacters.substr(
              Math.floor(codeCharacters.length * Math.random()),
              1
            );
          isNumber = !isNumber;
        } while (newCode.length < codeLen);
      } while (list.indexOf(newCode) >= 0);
      return [...list, newCode];
    }, []);
  }
}
