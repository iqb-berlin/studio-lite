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
import { Logger } from '@nestjs/common';
import { CodingSchemeFactory, CodingSchemeProblem } from '@iqb/responses';

/**
 * The coding report of a workspace: one row per coding variable of its units, built from the units
 * alone. {@link WorkspaceService} loads the units and hands them over.
 */
export class CodingReportClass {
  private static readonly logger = new Logger(CodingReportClass.name);

  private static readonly SCHEME_MISSING_OR_TOO_OLD = 'Kodierschema mit Schemer Version ab 1.5 erzeugen!';

  private static readonly SCHEME_UNREADABLE = 'Kodierschema kann nicht ausgewertet werden';

  /**
   * One row per coding variable of every unit in the workspace: what is coded, how, and what the
   * validation of the scheme against the unit's variables says. A unit whose scheme cannot be used
   * -- missing, written by a schemer too old for it, unparsable, or failing while it is evaluated --
   * still gets a row, so the report shows the gap instead of leaving the unit out.
   */
  static build(workspaceId: number, unitListWithMetadata: UnitPropertiesDto[]): CodingReportDto[] {
    return unitListWithMetadata.flatMap(unit => CodingReportClass.buildUnitRows(workspaceId, unit));
  }

  /**
   * The rows of one unit. Whatever its scheme throws stays with this unit: it gets a single row
   * saying so, and the other units of the workspace are reported as before (#1873).
   */
  private static buildUnitRows(workspaceId: number, unit: UnitPropertiesDto): CodingReportDto[] {
    if (!CodingReportClass.isValidScheme(unit.scheme, unit.schemer)) {
      return [CodingReportClass.invalidSchemeRow(unit, workspaceId, CodingReportClass.SCHEME_MISSING_OR_TOO_OLD)];
    }
    const unreadableRows = [
      CodingReportClass.invalidSchemeRow(unit, workspaceId, CodingReportClass.SCHEME_UNREADABLE)
    ];
    try {
      const parsedUnitScheme: CodingSchemeData = JSON.parse(unit.scheme);
      if (!parsedUnitScheme?.version) return unreadableRows;
      const validationResults = CodingSchemeFactory.validate(
        unit.variables,
        parsedUnitScheme.variableCodings
      );
      const unitDataRows: CodingReportDto[] = [];
      CodingReportClass.processVariableCodings(
        parsedUnitScheme,
        validationResults,
        unit,
        workspaceId,
        unitDataRows
      );
      return unitDataRows;
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      CodingReportClass.logger.warn(`Coding scheme of unit ${unit.id} cannot be evaluated: ${reason}`);
      return unreadableRows;
    }
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
      .map((problem): CodingReportValidationProblemDto => ({
        type: problem.type,
        breaking: problem.breaking,
        ...(problem.code ? { code: problem.code } : {})
      }))
      .concat(CodingReportClass.getCodesWithoutRules(codingVariable))
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

  /**
   * The codes of a variable that can never be assigned: neither a rule nor a manual instruction leads
   * to them. The validation of `@iqb/responses` does not look for this (#1873). Residual codes and
   * the intended-incomplete code are given without rules by design, and in a variable coded by hand
   * as a whole the coder may pick any code.
   */
  static getCodesWithoutRules(codingVariable: VariableCodingData): CodingReportValidationProblemDto[] {
    if (codingVariable.sourceType === 'MANUAL' ||
      codingVariable.codeModel === 'MANUAL_ONLY' ||
      CodingReportClass.hasText(codingVariable.manualInstruction)) return [];
    return (codingVariable.codes ?? [])
      .filter(code => typeof code.id === 'number' &&
        !['RESIDUAL', 'RESIDUAL_AUTO', 'INTENDED_INCOMPLETE'].includes(code.type) &&
        !CodingReportClass.hasText(code.manualInstruction) &&
        !(code.ruleSets ?? []).some(ruleSet => ruleSet.rules?.length > 0))
      .map(code => ({ type: 'CODE_WITHOUT_RULES', breaking: false, code: String(code.id) }));
  }

  /** Whether an instruction says anything; the schemer's editor leaves `<p></p>` behind when emptied. */
  private static hasText(html: string | undefined): boolean {
    return !!html?.replace(/&nbsp;|&#160;|&#xA0;/gi, ' ').split(/<[^>]*>/).some(part => part.trim());
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

  private static invalidSchemeRow(
    unit: UnitPropertiesDto,
    id: number,
    validation: string
  ): CodingReportDto {
    return {
      unit: CodingReportClass.generateUnitLink(id, unit),
      variable: '',
      variableType: '',
      item: '',
      validation,
      validationProblems: [],
      codingType: '',
      trainingEffort: ''
    };
  }
}
