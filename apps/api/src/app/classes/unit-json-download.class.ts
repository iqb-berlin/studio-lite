import {
  ItemsMetadataValues,
  ProfileValues,
  MetadataValuesEntry,
  UnitCommentDto,
  UnitDefinitionDto,
  UnitDownloadSettingsDto,
  UnitPropertiesDto,
  UnitSchemeDto
} from '@studio-lite-lib/api-dto';
import type AdmZip from 'adm-zip';
import { HIDDEN_PROFILE_ORDER, toVariableInfoListV1 } from '@studio-lite/shared-code';
import { VariableInfo } from '@iqbspecs/variable-info/variable-info.interface';
import { UnitService } from '../services/unit.service';
import { UnitDefinitionService } from '../services/unit-definition.service';
import { ExportReportMessage, ExportReportScope } from './export-report.class';
import {
  LanguageCodedText, MetadataValueJson, MetadataValuesJson, UnitIndexJson, UnitItemJson, UnitMetadataJson
} from '../interfaces/unit-json-specs.interface';
import { UnitCommentService } from '../services/unit-comment.service';
import { UnitRichNoteService } from '../services/unit-rich-note.service';
import { entryHasContent, hasCodingScheme, hasMetadataContent } from '../utils/unit-export-contents';
import { RichNotesDownloadClass } from './rich-notes-download.class';
import { parseDerivedCodings } from '../utils/derived-codings';

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

/**
 * A unit in the JSON format of the iqb specifications: the index file, the definition, the coding
 * scheme, the variables, the metadata and items, the comments and the rich notes, each in the file
 * its specification names. What does not fit a specification is reported, not written.
 */
export class UnitJsonDownloadClass {
  /**
   * Maps internal comment DTOs onto the iqb unit-comments@0.1 spec shape.
   * userId/unitId/upVotes/downVotes/userVote have no spec counterpart and are dropped without
   * information loss: they are overwritten or ignored on import.
   */
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

  // The one place that decides whether a text fits the language_coded_texts
  // shape of metadata-values@3.0 (lang pattern ^[a-z]{2}$) — keeping the
  // "kept" and "reported dropped" sets exact complements.
  private static isValidLanguageCodedText(text: unknown): text is LanguageCodedText {
    return !!text &&
      typeof (text as LanguageCodedText).lang === 'string' &&
      /^[a-z]{2}$/.test((text as LanguageCodedText).lang) &&
      typeof (text as LanguageCodedText).value === 'string';
  }

  /**
   * Normalizes internal text data (single object or array, e.g. label or valueAsText) to the
   * language_coded_texts shape of metadata-values@3.0. Items without a valid two-letter language
   * code have no spec counterpart and are dropped; empty lists become undefined since the spec
   * requires minItems: 1.
   */
  static toLanguageCodedTexts(texts: unknown): LanguageCodedText[] | undefined {
    const list = Array.isArray(texts) ? texts : [texts];
    const valid = list
      .filter(UnitJsonDownloadClass.isValidLanguageCodedText)
      .map(text => ({ lang: text.lang, value: text.value }));
    return valid.length ? valid : undefined;
  }

  // Reports every text that carried actual content but was dropped because
  // it does not fit the language_coded_texts shape.
  private static reportDroppedTexts(
    texts: unknown, entryId: string, scope?: ExportReportScope
  ): void {
    const list = Array.isArray(texts) ? texts : [texts];
    list
      .filter(text => !!text &&
        typeof (text as LanguageCodedText).value === 'string' &&
        (text as LanguageCodedText).value !== '' &&
        !UnitJsonDownloadClass.isValidLanguageCodedText(text))
      .forEach(text => scope?.report('dropped-content.invalid-language-code', {
        entryId,
        lang: typeof (text as LanguageCodedText).lang === 'string' ? (text as LanguageCodedText).lang : '',
        value: (text as LanguageCodedText).value
      }));
  }

  /**
   * Maps an internal entry value onto one of the three value forms of metadata-values@3.0:
   * simple_value (internal plain string plus valueAsText), vocabulary_entries (internal
   * { id, text } lists) or language_coded_texts. Returns undefined for empty values since the spec
   * requires `value`.
   */
  static transformEntryValue(entry: MetadataValuesEntry, scope?: ExportReportScope): MetadataValueJson | undefined {
    const { value } = entry;
    // metadata-values@3.x simple value { raw, asText } (form-created). The legacy
    // form stored the raw value as a plain string, handled just below.
    if (value && typeof value === 'object' && !Array.isArray(value) && 'raw' in value) {
      const simple = value as unknown as { raw?: string; asText?: unknown };
      if (!simple.raw) return undefined;
      const asText = UnitJsonDownloadClass.toLanguageCodedTexts(simple.asText ?? entry.valueAsText);
      return { raw: simple.raw, ...(asText && { asText }) };
    }
    if (typeof value === 'string') {
      if (!value) return undefined;
      const asText = UnitJsonDownloadClass.toLanguageCodedTexts(entry.valueAsText);
      return { raw: value, ...(asText && { asText }) };
    }
    if (Array.isArray(value) && value.length) {
      const vocabularyEntries = value
        .filter(entryValue => !!entryValue && typeof (entryValue as { id?: unknown }).id === 'string')
        .map(entryValue => {
          const vocabularyEntry = entryValue as {
            id: string; label?: unknown; text?: unknown; annotation?: unknown;
          };
          // metadata-values@3.x carries the vocab text in `label`, the legacy form in
          // `text`; the numbering (SKOS notation) travels in `annotation`.
          const texts = vocabularyEntry.label ?? vocabularyEntry.text;
          UnitJsonDownloadClass.reportDroppedTexts(texts, entry.id, scope);
          const label = UnitJsonDownloadClass.toLanguageCodedTexts(texts);
          const annotation = UnitJsonDownloadClass.toLanguageCodedTexts(vocabularyEntry.annotation);
          return {
            id: vocabularyEntry.id,
            ...(label && { label }),
            ...(annotation && { annotation })
          };
        });
      if (vocabularyEntries.length) {
        const presentValues = value.filter(entryValue => !!entryValue).length;
        if (vocabularyEntries.length < presentValues) {
          scope?.report('dropped-content.mixed-value-dropped', {
            entryId: entry.id,
            droppedCount: String(presentValues - vocabularyEntries.length)
          });
        }
        return vocabularyEntries;
      }
      UnitJsonDownloadClass.reportDroppedTexts(value, entry.id, scope);
      return UnitJsonDownloadClass.toLanguageCodedTexts(value);
    }
    return undefined;
  }

  /**
   * Maps internal profile values onto metadata-values@3.0. The profile `order` (-1 =
   * hidden/disabled, >= 0 = position) is emitted per spec; the internal-only `valueAsText` is
   * dropped. Profiles without profileId or without any exportable entry are omitted since the spec
   * requires profileId and entries with minItems: 1. Every dropped piece that carried content is
   * reported through the scope.
   */
  static transformProfilesToMetadataValues(
    profiles?: ProfileValues[], scope?: ExportReportScope
  ): MetadataValuesJson[] {
    return (profiles ?? []).flatMap(profile => {
      if (!profile?.profileId) {
        if (profile?.entries?.length) {
          scope?.report('dropped-content.profile-not-exported', {
            entryCount: String(profile.entries.length)
          });
        }
        return [];
      }
      const profileScope = scope?.forProfile(profile.profileId);
      const entries = (profile.entries ?? []).flatMap(entry => {
        if (!entry?.id) {
          if (entryHasContent(entry)) {
            profileScope?.report('dropped-content.entry-not-exported');
          }
          return [];
        }
        const value = UnitJsonDownloadClass.transformEntryValue(entry, profileScope);
        if (!value) return [];
        const label = UnitJsonDownloadClass.toLanguageCodedTexts(entry.label);
        return [{ id: entry.id, ...(label && { label }), value }];
      });
      if (!entries.length) return [];
      return [{ profileId: profile.profileId, order: profile.order ?? HIDDEN_PROFILE_ORDER, entries }];
    });
  }

  /**
   * Maps internal item data onto the iqb unit-items@0.2 spec shape: variableId/variableReadOnlyId
   * become sourceVariableId/sourceVariableUuid; unitId has no spec counterpart and is dropped.
   * Items without the required id are skipped.
   */
  static transformItems(items?: ItemsMetadataValues[], scope?: ExportReportScope): UnitItemJson[] {
    return (items ?? []).flatMap((item, itemIndex) => {
      if (!item?.id) {
        if (item) {
          scope?.report(
            'dropped-content.item-not-exported',
            item.uuid ? { uuid: item.uuid } : undefined
          );
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
      const metadata = UnitJsonDownloadClass.transformProfilesToMetadataValues(item.profiles, scope);
      if (metadata.length) transformed.metadata = metadata;
      return [transformed];
    });
  }

  static async getUnitDataJSON(
    unitService: UnitService,
    unitDefinitionService: UnitDefinitionService,
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

    const definitionData = await unitDefinitionService.findOnesDefinition(unitId);
    if (unitMetadata.editor) index.userInterface.editor = unitMetadata.editor;
    if (definitionData?.definition?.length > 0) {
      zip.addFile(`${key}.voud`, Buffer.from(definitionData.definition));
      index.userInterface.definition = `${key}.voud`;
      index.userInterface.isDefinitionInline = false;
      if (definitionData.definitionType) index.userInterface.type = definitionData.definitionType;
    }
    if (unitMetadata.lastChangedDefinition) {
      index.userInterface.modifiedAt = unitMetadata.lastChangedDefinition.toISOString();
    }

    const schemeData = await unitDefinitionService.findOnesScheme(unitId);
    // a missing flag means "add" -- see UnitDownloadSettingsDto
    if (unitDownloadSettings.addCodingScheme !== false && hasCodingScheme(schemeData?.scheme)) {
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
        const transformedComments = UnitJsonDownloadClass.transformComments(comments);
        zip.addFile(`${key}.voco.json`, Buffer.from(JSON.stringify(transformedComments, null, 2)));
        index.comments = { id: `${key}.voco.json`, type: 'iqb-unit-comments' };
      }
    }

    if (unitDownloadSettings.addRichNotes) {
      const { notes, tags } = await unitRichNoteService.findNotes(unitId);
      if (notes?.length) {
        const transformedNotes = RichNotesDownloadClass.transformRichNotes(notes, tags);
        zip.addFile(`${key}.vorn.json`, Buffer.from(JSON.stringify(transformedNotes, null, 2)));
        index.richNotes = { id: `${key}.vorn.json`, type: 'iqb-unit-rich-notes' };
      }
    }

    if (unitDownloadSettings.addMetadata !== false) {
      UnitJsonDownloadClass.addMetadataJSON(unitMetadata, index, zip, exportReport);
    }

    if (unitDownloadSettings.addItems !== false) {
      UnitJsonDownloadClass.addItemsJSON(unitMetadata, index, zip, exportReport);
    }

    const variables = UnitJsonDownloadClass.buildVariablesJSON(definitionData, schemeData);
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

  private static addMetadataJSON(
    unitMetadata: UnitPropertiesDto,
    index: UnitIndexJson,
    zip: AdmZip,
    exportReport: ExportReportMessage[]
  ): void {
    const key = unitMetadata.key;
    const metadataScope = new ExportReportScope(key, `${key}.vomd.json`, exportReport);
    const reportedBefore = exportReport.length;
    const metadataValues = UnitJsonDownloadClass
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
    } else if (
      exportReport.length === reportedBefore &&
      hasMetadataContent(unitMetadata.metadata)
    ) {
      // stored metadata exists but none of it fits the spec and the
      // transform reported nothing specific (e.g. a legacy shape without
      // profileId) — before the spec export this was written verbatim, so
      // the omission must not stay silent
      metadataScope.report('dropped-content.metadata-not-exported');
    }
  }

  private static addItemsJSON(
    unitMetadata: UnitPropertiesDto,
    index: UnitIndexJson,
    zip: AdmZip,
    exportReport: ExportReportMessage[]
  ): void {
    const key = unitMetadata.key;
    const itemsScope = new ExportReportScope(key, `${key}.voit.json`, exportReport);
    const items = UnitJsonDownloadClass.transformItems(unitMetadata.metadata?.items, itemsScope);
    if (items.length) {
      zip.addFile(`${key}.voit.json`, Buffer.from(JSON.stringify(items, null, 2)));
      index.items = {
        id: `${key}.voit.json`,
        type: 'unit-items@0.2',
        ...(unitMetadata.lastChangedMetadata && { modifiedAt: unitMetadata.lastChangedMetadata.toISOString() })
      };
    }
  }

  static buildVariablesJSON(
    definitionData: UnitDefinitionDto,
    schemeData: UnitSchemeDto
  ): { baseVariables: VariableInfo[]; derivedVariables: { id: string; basedOn: string[] }[] } | null {
    // exported in the VariableInfo 1.x spelling, as the unit XML is (#1708)
    const baseVariables: VariableInfo[] = toVariableInfoListV1(definitionData?.variables);
    const derivedVariables: { id: string; basedOn: string[] }[] = parseDerivedCodings(schemeData)
      .map(coding => ({
        id: coding.alias || coding.id,
        basedOn: coding.deriveSources ?? []
      }));

    if (baseVariables.length === 0 && derivedVariables.length === 0) return null;
    return { baseVariables, derivedVariables };
  }
}
