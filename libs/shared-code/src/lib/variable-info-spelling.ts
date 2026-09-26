import { VariableInfo } from '@iqbspecs/variable-info/variable-info.interface';

/**
 * Spelling of VariableInfo `type` and `format`.
 *
 * VariableInfo 2.0 writes both in upper case with underscores (`NO_VALUE`, `GGB_FILE`); 1.x wrote
 * them in lower case with hyphens (`no-value`, `ggb-file`). Editors that follow 2.0 send the new
 * spelling, but everything that reads the list still compares against 1.x: studio-lite itself,
 * the schemer it hands the list to, and coding-box, which reads it from the unit XML. The schemer
 * and coding-box are released on their own schedules.
 *
 * Studio therefore brings each list into the 1.x spelling where it enters, and everything behind
 * that point keeps seeing what it saw before (#1606). The mapping is lossless: 2.0 has exactly the
 * values of 1.x in the other spelling. An entry that is already in 1.x is left untouched, byte for
 * byte, and so is one whose type neither spelling knows.
 *
 * Once studio, the schemer and coding-box read both spellings, this bridge can go -- path by
 * path, as each of them is released.
 */

type TypeV1 = VariableInfo['type'];
type FormatV1 = VariableInfo['format'];

const TYPES_V2_TO_V1: Readonly<Record<string, TypeV1>> = {
  STRING: 'string',
  INTEGER: 'integer',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  ATTACHMENT: 'attachment',
  JSON: 'json',
  NO_VALUE: 'no-value',
  CODED: 'coded'
};

const FORMATS_V2_TO_V1: Readonly<Record<string, FormatV1>> = {
  TEXT_SELECTION: 'text-selection',
  IMAGE: 'image',
  CAPTURE_IMAGE: 'capture-image',
  AUDIO: 'audio',
  GGB_FILE: 'ggb-file',
  NON_NEGATIVE: 'non-negative',
  LATEX: 'latex',
  MATH_ML: 'math-ml',
  MATH_TABLE: 'math-table',
  MATH_TEXT_MIX: 'math-text-mix',
  GGB_VARIABLE: 'ggb-variable'
};

/** A VariableInfo whose `type` and `format` may come in the spelling of either version. */
export type VariableInfoInEitherSpelling = Omit<VariableInfo, 'type' | 'format'> & {
  type: string;
  format?: string;
};

/**
 * One VariableInfo in the 1.x spelling. An entry that comes in the 2.0 spelling also gets back
 * the `page` that 2.0 dropped, as the empty value editors always sent -- otherwise the attribute
 * would disappear from the unit XML. A format that 1.x does not know, such as one added after 2.0,
 * is kept as it is: there is nothing to map it to.
 */
export function toVariableInfoV1(variable: VariableInfoInEitherSpelling): VariableInfo {
  const type = TYPES_V2_TO_V1[variable.type];
  if (!type) return variable as VariableInfo;
  const format = variable.format ?? '';
  return {
    ...variable,
    type,
    format: FORMATS_V2_TO_V1[format] ?? format as FormatV1,
    page: variable.page ?? ''
  };
}

/** A whole variable list in the 1.x spelling, see toVariableInfoV1. */
export function toVariableInfoListV1(
  variables: VariableInfoInEitherSpelling[] | null | undefined
): VariableInfo[] {
  return (variables ?? []).map(toVariableInfoV1);
}

/** The value with the keys of every object sorted, so that its JSON no longer depends on key order. */
function withSortedKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(withSortedKeys);
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map(key => [key, withSortedKeys((value as Record<string, unknown>)[key])])
    );
  }
  return value;
}

/**
 * Whether two variable lists say the same, regardless of spelling and of key order. An editor
 * in the 2.0 spelling produces a list that differs from the stored one in both -- its `page` sits
 * elsewhere, or is missing -- without anything having changed. A missing list is not the same as
 * an empty one, as before.
 */
export function sameVariableLists(
  a: VariableInfoInEitherSpelling[] | null | undefined,
  b: VariableInfoInEitherSpelling[] | null | undefined
): boolean {
  const comparable = (list: VariableInfoInEitherSpelling[] | null | undefined) => JSON.stringify(
    list ? withSortedKeys(toVariableInfoListV1(list)) : list
  );
  return comparable(a) === comparable(b);
}
