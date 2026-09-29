import { VariableInfo } from '@iqbspecs/variable-info/variable-info.interface';
import {
  sameVariableLists,
  toVariableInfoListV1,
  toVariableInfoV1,
  VariableInfoInEitherSpelling
} from './variable-info-spelling';

// The value lists of @iqbspecs/variable-info 2.0.0 and 1.3.0, side by side.
const TYPES: [string, VariableInfo['type']][] = [
  ['STRING', 'string'], ['INTEGER', 'integer'], ['NUMBER', 'number'], ['BOOLEAN', 'boolean'],
  ['ATTACHMENT', 'attachment'], ['JSON', 'json'], ['NO_VALUE', 'no-value'], ['CODED', 'coded']
];
const FORMATS: [string, VariableInfo['format']][] = [
  ['TEXT_SELECTION', 'text-selection'], ['IMAGE', 'image'], ['CAPTURE_IMAGE', 'capture-image'],
  ['AUDIO', 'audio'], ['GGB_FILE', 'ggb-file'], ['NON_NEGATIVE', 'non-negative'], ['LATEX', 'latex'],
  ['MATH_ML', 'math-ml'], ['MATH_TABLE', 'math-table'], ['MATH_TEXT_MIX', 'math-text-mix'],
  ['GGB_VARIABLE', 'ggb-variable'], ['', '']
];

/** An entry the way a 2.0 editor sends it: upper case, and no `page`. */
const v2 = (type: string, format: string, extra: Partial<VariableInfoInEitherSpelling> = {}) => ({
  id: 'var1',
  alias: 'var1',
  type,
  format,
  multiple: false,
  nullable: false,
  values: [],
  valuePositionLabels: [],
  valuesComplete: false,
  ...extra
});

/** The same entry the way a 1.x editor sent it, `page` in the middle as aspect has it. */
const v1 = (type: VariableInfo['type'], format: VariableInfo['format']): VariableInfo => ({
  id: 'var1',
  alias: 'var1',
  type,
  format,
  multiple: false,
  nullable: false,
  values: [],
  valuePositionLabels: [],
  page: '',
  valuesComplete: false
});

describe('variable-info-spelling', () => {
  describe('toVariableInfoV1', () => {
    it.each(TYPES)('maps the type %s to %s', (upper, lower) => {
      expect(toVariableInfoV1(v2(upper, '')).type).toBe(lower);
    });

    it.each(FORMATS)('maps the format "%s" to "%s"', (upper, lower) => {
      expect(toVariableInfoV1(v2('STRING', upper)).format).toBe(lower);
    });

    it('leaves an entry in the 1.x spelling untouched', () => {
      const entry = v1('no-value', '');
      expect(toVariableInfoV1(entry)).toBe(entry);
    });

    it('gives an entry in the 2.0 spelling back the empty page that 2.0 dropped', () => {
      expect(toVariableInfoV1(v2('STRING', 'LATEX')).page).toBe('');
    });

    it('keeps a page an entry in the 2.0 spelling still carries', () => {
      expect(toVariableInfoV1(v2('STRING', '', { page: '2' })).page).toBe('2');
    });

    it('keeps a format that 1.x does not know, such as one added after 2.0', () => {
      expect(toVariableInfoV1(v2('JSON', 'CHEM_MOLECULE')).format).toBe('CHEM_MOLECULE');
    });

    it('leaves an entry untouched whose type neither spelling knows', () => {
      const entry = v2('SOMETHING_NEW', 'LATEX');
      expect(toVariableInfoV1(entry)).toBe(entry);
    });

    it('keeps everything besides type, format and page', () => {
      const entry = v2('BOOLEAN', '', {
        alias: 'box',
        multiple: true,
        nullable: true,
        values: [{ value: true, label: 'ja' }],
        valuePositionLabels: ['eins'],
        valuesComplete: true
      });
      expect(toVariableInfoV1(entry)).toEqual({ ...entry, type: 'boolean', page: '' });
    });

    it('comes to the same result when applied twice', () => {
      const once = toVariableInfoV1(v2('NUMBER', 'NON_NEGATIVE'));
      expect(toVariableInfoV1(once)).toEqual(once);
    });
  });

  describe('toVariableInfoListV1', () => {
    it('maps every entry of a list', () => {
      expect(toVariableInfoListV1([v2('STRING', ''), v2('NO_VALUE', '')]).map(v => v.type))
        .toEqual(['string', 'no-value']);
    });

    it('returns an empty list for a missing one', () => {
      expect(toVariableInfoListV1(undefined)).toEqual([]);
      expect(toVariableInfoListV1(null)).toEqual([]);
    });
  });

  describe('sameVariableLists', () => {
    it('finds the list of a 2.0 editor the same as the stored 1.x list it replaces', () => {
      expect(sameVariableLists([v2('STRING', 'GGB_FILE')], [v1('string', 'ggb-file')])).toBe(true);
    });

    it('finds two lists different that differ in content', () => {
      expect(sameVariableLists([v2('STRING', 'LATEX')], [v1('string', 'ggb-file')])).toBe(false);
    });

    it('does not depend on the order of the keys', () => {
      const { page, ...rest } = v1('integer', '');
      expect(sameVariableLists([{ page, ...rest }], [v1('integer', '')])).toBe(true);
    });

    it('keeps telling a missing list from an empty one', () => {
      expect(sameVariableLists(undefined, [])).toBe(false);
      expect(sameVariableLists(undefined, undefined)).toBe(true);
    });
  });
});
