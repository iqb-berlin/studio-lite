export type RuleMethod = 'MATCH' | 'MATCH_REGEX' | 'NUMERIC_RANGE' | 'NUMERIC_LESS_THEN' | 'NUMERIC_MORE_THEN' |
'NUMERIC_MAX' | 'NUMERIC_MIN' | 'IS_EMPTY' | 'ELSE';

export type ValueTransformation = 'TO_UPPER' | 'REMOVE_WHITE_SPACES' | 'DATE_TO_ISO' | 'TIME_TO_ISO';

export interface CodingRule {
  method: RuleMethod,
  parameters: string[],
}

export interface CodeData {
  id: number,
  label: string,
  score: number,
  rules: CodingRule[],
  manualInstruction: string
}

export interface VariableCodingData {
  id: string;
  label: string;
  sourceType: 'BASE' | 'DERIVE_CONCAT' | 'DERIVE_SUM';
  deriveSources: string[];
  deriveSourceType: 'VALUE' | 'CODE' | 'SCORE';
  valueTransformations: ValueTransformation[];
  manualInstruction: string;
  codes: CodeData[];
}

export interface CodingSchemeDto {
  variableCodings: VariableCodingData[]
}
