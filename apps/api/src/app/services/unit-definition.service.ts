import { BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  UnitDefinitionDto,
  UnitDefinitionFullDto,
  UnitSchemeDto
} from '@studio-lite-lib/api-dto';
import { toVariableInfoListV1 } from '@studio-lite/shared-code';
import Unit from '../entities/unit.entity';
import UnitDefinition from '../entities/unit-definition.entity';
import { isCodingScheme } from '../utils/coding-scheme';

/**
 * What a unit is played and coded from: its definition, written by the editor, and its coding
 * scheme, written by the schemer -- read for the modules and the export, saved from the modules,
 * the import and a unit copy.
 *
 * The two are kept in step where the definition changes: saving new variables renames their
 * codings in the stored scheme (see `patchDefinition`).
 */
export class UnitDefinitionService {
  private readonly logger = new Logger(UnitDefinitionService.name);

  constructor(
    @InjectRepository(Unit)
    private unitsRepository: Repository<Unit>,
    @InjectRepository(UnitDefinition)
    private unitDefinitionsRepository: Repository<UnitDefinition>
  ) {}

  async findUnitDefinitionByUnitId(unitId: number): Promise<UnitDefinitionFullDto> {
    return this.unitDefinitionsRepository.findOne({
      where: { unitId: unitId }
    });
  }

  async findOnesDefinition(unitId: number): Promise<UnitDefinitionDto> {
    const unit = await this.unitsRepository.findOne({
      where: { id: unitId }
    });
    this.logger.log(`Retrieving unit definition for unit with id ${unitId} and workspaceId ${unit.workspaceId}`);
    const returnUnit: UnitDefinitionDto = {
      variables: unit.variables, definition: ''
    };
    const unitDefinition = await this.findUnitDefinitionByUnitId(unitId);
    if (unitDefinition) {
      returnUnit.definition = unitDefinition.data;
      if (unitDefinition.type) returnUnit.definitionType = unitDefinition.type;
    }
    return returnUnit;
  }

  /**
   * The scheme with the variables it codes. These go to the schemer, which still reads only the
   * VariableInfo 1.x spelling (iqb-berlin/coding-components#238), so a list stored in 2.x is handed
   * out in 1.x (#1708).
   */
  async findOnesScheme(unitId: number): Promise<UnitSchemeDto> {
    const unit = await this.unitsRepository.findOne({
      where: { id: unitId },
      select: ['scheme', 'schemeType', 'variables']
    });
    return {
      variables: unit.variables && toVariableInfoListV1(unit.variables),
      scheme: unit.scheme,
      schemeType: unit.schemeType
    };
  }

  async patchDefinition(unitId: number,
                        unitDefinitionDto: UnitDefinitionDto,
                        userName: string | null,
                        definitionDate: Date | null): Promise<void> {
    const unitToUpdate = await this.unitsRepository.findOne({
      where: { id: unitId }
    });

    unitToUpdate.lastChangedDefinition = definitionDate;
    unitToUpdate.lastChangedDefinitionUser = userName;

    const unitDefinitionToUpdate = await this.findUnitDefinitionByUnitId(unitId);
    // The type describes the definition it came with, so it is written only together with one, and
    // a definition without a type takes the stored one away: an editor that does not report the
    // format has just written a definition the old type may no longer describe. Without a
    // definition (only the variables changed) neither is touched -- undefined is skipped on save.
    const definitionType = unitDefinitionDto.definition === undefined ?
      undefined :
      unitDefinitionDto.definitionType || null;

    if (unitDefinitionToUpdate) {
      unitDefinitionToUpdate.data = unitDefinitionDto.definition;
      unitDefinitionToUpdate.type = definitionType;
      await this.unitDefinitionsRepository.save(unitDefinitionToUpdate);
    } else {
      const newUnitDefinition = this.unitDefinitionsRepository
        .create({ data: unitDefinitionDto.definition, type: definitionType, unitId });
      await this.unitDefinitionsRepository.save(newUnitDefinition);
    }
    if (unitDefinitionDto.variables) {
      // Stored in the spelling the editor or the imported file used, VariableInfo 1.x or 2.x (#1708).
      // Readers that still need 1.x get it where the list leaves the studio (findOnesScheme, the
      // unit export). Saving from the editor and importing both come through this method.
      unitToUpdate.variables = unitDefinitionDto.variables;
      const aliasIds = unitDefinitionDto.variables.map(item => ({
        id: item.id,
        alias: item.alias || item.id
      }));
      if (unitToUpdate.scheme) {
        unitToUpdate.scheme = UnitDefinitionService.getUpdatedScheme(unitToUpdate.scheme, aliasIds);
      }
    }
    await this.unitsRepository.save(unitToUpdate);
  }

  private static getUpdatedScheme(scheme: string, variableAliasId: { id: string; alias: string }[]): string {
    const schemeObject = JSON.parse(scheme);
    if (schemeObject.variableCodings) {
      schemeObject.variableCodings = schemeObject.variableCodings.reduce((acc, item) => {
        if (item.sourceType === 'BASE_NO_VALUE') {
          const found = variableAliasId.find(v => v.id === item.id);
          if (found) {
            item.alias = found.alias;
            acc.push(item);
          }
        } else if (item.sourceType === 'BASE') {
          const found = variableAliasId.find(v => v.id === item.id);
          if (found) {
            item.alias = found.alias;
          }
          acc.push(item);
        } else {
          acc.push(item);
        }
        return acc;
      }, []);
      return JSON.stringify(schemeObject);
    }
    return scheme;
  }

  async patchScheme(unitId: number,
                    unitSchemeDto: UnitSchemeDto,
                    userName: string | null,
                    schemeDate: Date | null): Promise<void> {
    // Only a scheme with its list of variable codings is stored: getUpdatedScheme parses it on every
    // later save of the definition, and the coding check in the preview reads the list.
    if (!isCodingScheme(unitSchemeDto.scheme)) {
      throw new BadRequestException('The coding scheme has no list of variable codings');
    }
    const unitToUpdate = await this.unitsRepository.findOne({
      where: { id: unitId }
    });
    unitToUpdate.scheme = unitSchemeDto.scheme;
    unitToUpdate.schemeType = unitSchemeDto.schemeType;
    unitToUpdate.lastChangedScheme = schemeDate;
    unitToUpdate.lastChangedSchemeUser = userName;
    await this.unitsRepository.save(unitToUpdate);
  }
}
