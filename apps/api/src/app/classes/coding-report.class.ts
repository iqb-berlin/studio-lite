import {
  CodingReportDto,
  CodingReportValidationProblemDto,
  ItemsMetadataValues,
  UnitPropertiesDto
} from '@studio-lite-lib/api-dto';
import {
  CodeData,
  CodingSchemeData,
  RuleSet,
  VariableCodingData
} from '@iqbspecs/coding-scheme/coding-scheme.interface';
import { CodingSchemeFactory, CodingSchemeProblem } from '@iqb/responses';

/**
 * The coding report of a workspace: one row per coding variable of its units, built from the units
 * alone. {@link WorkspaceService} loads the units and hands them over.
 */
export class CodingReportClass {
  /**
   * One row per coding variable of every unit in the workspace: what is coded, how, and what the
   * validation of the scheme against the unit's variables says. A unit whose scheme cannot be used
   * -- missing, unparsable, or written by a schemer too old for it -- still gets a row, so the
   * report shows the gap instead of leaving the unit out.
   */
  static build(workspaceId: number, unitListWithMetadata: UnitPropertiesDto[]): CodingReportDto[] {
    const unitDataRows: CodingReportDto[] = [];
    unitListWithMetadata.forEach((unit: UnitPropertiesDto) => {
      if (CodingReportClass.isValidScheme(unit.scheme, unit.schemer)) {
        const parsedUnitScheme = CodingReportClass.parseScheme(unit.scheme);
        const version = 'version';
        if (parsedUnitScheme && parsedUnitScheme[version]) {
          const validationResults = CodingSchemeFactory.validate(
            unit.variables,
            parsedUnitScheme.variableCodings
          );
          CodingReportClass.processVariableCodings(
            parsedUnitScheme,
            validationResults,
            unit,
            workspaceId,
            unitDataRows
          );
        }
      } else {
        CodingReportClass.addInvalidSchemeRow(unit, workspaceId, unitDataRows);
      }
    });

    return unitDataRows;
  }

  /**
   * Whether a unit's coding scheme can be read at all. A scheme without a schemer is the current
   * JSON format, which no longer names one; an older scheme is only usable from schemer 1.5 on.
   */
  private static isValidScheme(
    scheme: string | undefined,
    schemer: string
  ): boolean {
    if (!scheme) return false;
    if (!schemer) return true; // JSON format: schemer is no longer explicitly assigned per spec
    return schemer.split('@')[1] >= '1.5';
  }

  private static parseScheme(scheme: string): CodingSchemeData | null {
    try {
      return JSON.parse(scheme);
    } catch {
      return null; // Catch JSON parsing errors gracefully
    }
  }

  static processVariableCodings(
    parsedUnitScheme: CodingSchemeData,
    validationResults: CodingSchemeProblem[],
    unit: UnitPropertiesDto,
    workspaceId: number,
    unitDataRows: CodingReportDto[]
  ): void {
    parsedUnitScheme.variableCodings
      ?.filter(vc => vc.sourceType !== 'BASE_NO_VALUE')
      .forEach((codingVariable: VariableCodingData) => {
        const validationProblems = CodingReportClass.getValidationProblems(
          validationResults,
          codingVariable
        );
        const validationResultText = CodingReportClass.getValidationStatus(
          validationProblems
        );
        const codingType = CodingReportClass.determineCodingType(codingVariable);
        const trainingEffort = CodingReportClass.determineTrainingEffort(
          codingVariable
        );
        const foundItem = CodingReportClass.findMatchingItem(
          unit,
          codingVariable
        );

        unitDataRows.push({
          unit: CodingReportClass.generateUnitLink(workspaceId, unit),
          variable: codingVariable.alias || codingVariable.id || '–',
          variableType: CodingReportClass.determineVariableType(codingVariable),
          item: foundItem?.id || '–',
          validation: validationResultText,
          validationProblems,
          codingType: codingType,
          trainingEffort: trainingEffort
        });
      });
  }

  static getValidationProblems(
    validationResults: CodingSchemeProblem[],
    codingVariable: VariableCodingData
  ): CodingReportValidationProblemDto[] {
    const codingVariableId = codingVariable.alias || codingVariable.id;
    const seenProblems = new Set<string>();

    return validationResults
      .filter(problem => problem.variableId === codingVariableId)
      .map(problem => ({
        type: problem.type,
        breaking: problem.breaking,
        ...(problem.code ? { code: problem.code } : {})
      }))
      .filter(problem => {
        const key = `${problem.type}|${problem.breaking}|${problem.code || ''}`;
        if (seenProblems.has(key)) return false;
        seenProblems.add(key);
        return true;
      })
      .sort((problemA, problemB) => (
        Number(problemB.breaking) - Number(problemA.breaking) ||
        problemA.type.localeCompare(problemB.type) ||
        (problemA.code || '').localeCompare(problemB.code || '')
      ));
  }

  static getValidationStatus(
    validationProblems: CodingReportValidationProblemDto[]
  ): string {
    if (validationProblems.some(problem => problem.breaking)) return 'Fehler';
    if (validationProblems.length > 0) return 'Warnung';
    return 'OK';
  }

  static determineCodingType(codingVariable: VariableCodingData): string {
    let closedCoding = false;
    let manualCodingOnly = true;
    let hasRules = false;

    codingVariable.codes?.forEach((code: CodeData) => {
      // Both are optional in the coding scheme spec, and a code can come without either (#1873).
      if (!code.manualInstruction) manualCodingOnly = false;

      (code.ruleSets ?? []).forEach((ruleSet: RuleSet) => {
        hasRules ||= ruleSet.rules.length > 0;
        manualCodingOnly &&= ruleSet.rules.length === 0;
      });

      closedCoding ||= ['RESIDUAL_AUTO', 'INTENDED_INCOMPLETE'].includes(
        code.type
      );
    });

    if (closedCoding) return 'automatisch';
    if (manualCodingOnly) return 'manuell';
    if (hasRules) return 'halbautomatisch';
    return 'keine Regeln';
  }

  static determineVariableType(codingVariable: VariableCodingData): string {
    return codingVariable.sourceType === 'BASE' ?
      'Basisvariable' :
      'abgeleitete Variable';
  }

  static determineTrainingEffort(codingVariable: VariableCodingData): string {
    return codingVariable.processing?.includes('CODER_TRAINING_REQUIRED') ?
      'erhöht' :
      'normal';
  }

  static findMatchingItem(
    unit: UnitPropertiesDto,
    codingVariable: VariableCodingData
  ): ItemsMetadataValues {
    const codingVariableId = codingVariable.alias || codingVariable.id;
    return unit.metadata.items?.find(
      item => item.variableId === codingVariableId
    );
  }

  static generateUnitLink(id: number, unit: UnitPropertiesDto): string {
    return (
      `<a href=#/a/${id}/${unit.id}>${unit.key}${unit.name ? ': ' : ''}${
        unit.name
      }</a>` || '-'
    );
  }

  static addInvalidSchemeRow(
    unit: UnitPropertiesDto,
    id: number,
    unitDataRows: CodingReportDto[]
  ): void {
    unitDataRows.push({
      unit: CodingReportClass.generateUnitLink(id, unit),
      variable: '',
      variableType: '',
      item: '',
      validation: 'Kodierschema mit Schemer Version ab 1.5 erzeugen!',
      validationProblems: [],
      codingType: '',
      trainingEffort: ''
    });
  }
}
