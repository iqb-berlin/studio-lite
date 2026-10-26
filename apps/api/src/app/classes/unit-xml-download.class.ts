import {
  UnitMetadataValues,
  UnitCommentDto,
  UnitDefinitionDto,
  UnitDownloadSettingsDto,
  UnitExportConfigDto,
  UnitPropertiesDto,
  UnitSchemeDto
} from '@studio-lite-lib/api-dto';
import type AdmZip from 'adm-zip';
import * as XmlBuilder from 'xmlbuilder2';
import { toUnitXmlFormat, toVariableInfoListV1 } from '@studio-lite/shared-code';
// Type-only, like every deep import into a package: should the package add an `exports` map, a
// runtime require of this path would kill the boot -- see the import in api-file.decorator.ts.
import type { XMLBuilder } from 'xmlbuilder2/lib/interfaces';
import { VariableCodingData } from '@iqbspecs/coding-scheme/coding-scheme.interface';
import { UnitService } from '../services/unit.service';
import { UnitMetadataService } from '../services/unit-metadata.service';
import { UnitDefinitionService } from '../services/unit-definition.service';
import { UnitCommentService } from '../services/unit-comment.service';
import { UnitRichNoteService } from '../services/unit-rich-note.service';
import { hasItems, hasMetadataContent } from '../utils/unit-export-contents';
import { LegacyMetadataDownloadClass } from './legacy-metadata-download.class';
import { RichNotesDownloadClass } from './rich-notes-download.class';
import { parseDerivedCodings } from '../utils/derived-codings';

/**
 * A unit in the XML format the testcenter reads: the unit file with its references, and beside it
 * the definition, the coding scheme, the metadata in the old `.vomd` form, the comments as `.vouc`
 * and the rich notes as `.vorn`. {@link UnitDownloadClass} calls it once per unit.
 */
export class UnitXmlDownloadClass {
  static async getUnitData(
    unitService: UnitService,
    unitMetadataService: UnitMetadataService,
    unitDefinitionService: UnitDefinitionService,
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
    // a missing flag means "add" -- see UnitDownloadSettingsDto
    const withMetadata = unitDownloadSettings.addMetadata !== false;
    const unitXml = UnitXmlDownloadClass.createUnitXML(
      unitExportConfig,
      unitMetadata,
      withMetadata
    );
    if (withMetadata) {
      const hideNumbering = await unitMetadataService.buildHideNumberingMap(unitMetadata.metadata);
      UnitXmlDownloadClass.addMetadata(unitMetadata, zip, hideNumbering);
    }
    const definitionData = await unitDefinitionService.findOnesDefinition(unitId);
    UnitXmlDownloadClass.addUnitDefinition(
      definitionData,
      unitXml,
      unitMetadata,
      zip
    );
    UnitXmlDownloadClass.addVariables(definitionData, unitXml);
    if (unitDownloadSettings.addComments) {
      const comments = await unitCommentService.findOnesComments(unitId);
      UnitXmlDownloadClass.addComments(comments, unitXml, unitMetadata, zip);
    }
    const schemeData = await unitDefinitionService.findOnesScheme(unitId);
    if (unitDownloadSettings.addCodingScheme !== false) {
      UnitXmlDownloadClass.addScheme(schemeData, unitXml, unitMetadata, zip);
    }
    // the variables are part of the unit, with or without the scheme they are derived in
    UnitXmlDownloadClass.addDerivedVariables(schemeData, unitXml);
    if (unitDownloadSettings.addRichNotes) {
      await UnitXmlDownloadClass.addRichNotes(
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
    unitMetadata: UnitPropertiesDto,
    withMetadata = true
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
              withMetadata && UnitXmlDownloadClass.hasMetadataFile(unitMetadata.metadata) ?
                `${unitMetadata.key}.vomd` :
                ''
          }
        }
      }
    );
  }

  static addMetadata(
    unitMetadata: UnitPropertiesDto,
    zip: AdmZip,
    hideNumbering: Record<string, Record<string, boolean>> = {}
  ): void {
    if (UnitXmlDownloadClass.hasMetadataFile(unitMetadata.metadata)) {
      zip.addFile(
        `${unitMetadata.key}.vomd`,
        Buffer.from(JSON.stringify(
          LegacyMetadataDownloadClass.toLegacyMetadataBlob(unitMetadata.metadata, hideNumbering)
        ))
      );
    }
  }

  // The XML metadata file carries the unit's metadata and its items together, so it is written
  // when either has content -- and never as an empty `{"profiles":[],"items":[]}`.
  private static hasMetadataFile(metadata?: UnitMetadataValues): boolean {
    return hasMetadataContent(metadata) || hasItems(metadata);
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
          ...(definitionData.definitionType && {
            '@type': definitionData.definitionType
          }),
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
      // In the VariableInfo 1.x spelling, whatever is stored: coding-box, the testcenter and the
      // unit XSD read only that one (#1708). A format 1.x does not know is spelled as 1.x would (#1857).
      toVariableInfoListV1(definitionData.variables).forEach(transformedVariable => {
        const variableElement = variablesElement.ele({
          Variable: {
            '@id': transformedVariable.id,
            '@alias': transformedVariable.alias,
            '@type': transformedVariable.type,
            '@format': toUnitXmlFormat(transformedVariable.format),
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

  static addDerivedVariables(
    schemeData: UnitSchemeDto,
    unitXml: XMLBuilder
  ): void {
    const derivedCodings = parseDerivedCodings(schemeData);
    if (derivedCodings.length === 0) return;
    const derivedVariablesElement = unitXml.root().ele('DerivedVariables');
    derivedCodings.forEach(coding => {
      derivedVariablesElement.ele({
        Variable: {
          '@id': coding.alias || coding.id,
          '@type': UnitXmlDownloadClass.getDerivedVariableType(coding),
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

  static async addRichNotes(
    unitRichNoteService: UnitRichNoteService,
    unitId: number,
    unitXml: XMLBuilder,
    unitMetadata: UnitPropertiesDto,
    zip: AdmZip
  ): Promise<void> {
    const { notes, tags } = await unitRichNoteService.findNotes(unitId);
    if (notes && notes.length) {
      const transformedNotes = RichNotesDownloadClass.transformRichNotes(notes, tags);
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
}
