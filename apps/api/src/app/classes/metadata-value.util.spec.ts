import { combineNotationAndLabel } from './metadata-value.util';

describe('combineNotationAndLabel', () => {
  it('prepends the notation to each label per language', () => {
    const result = combineNotationAndLabel(
      [{ lang: 'de', value: '1.2' }],
      [{ lang: 'de', value: 'Foo' }, { lang: 'en', value: 'Bar' }]
    );
    expect(result).toEqual([
      { lang: 'de', value: '1.2 Foo' },
      { lang: 'en', value: '1.2 Bar' }
    ]);
  });

  it('returns the labels unchanged when there is no notation', () => {
    const labels = [{ lang: 'de', value: 'Foo' }];
    expect(combineNotationAndLabel([], labels)).toEqual(labels);
    expect(combineNotationAndLabel(undefined, labels)).toEqual(labels);
  });

  it('returns an empty list when there is no label', () => {
    expect(combineNotationAndLabel([{ lang: 'de', value: '1.2' }], undefined)).toEqual([]);
    expect(combineNotationAndLabel([{ lang: 'de', value: '1.2' }], [])).toEqual([]);
  });

  it('uses the first notation entry as the numbering', () => {
    const result = combineNotationAndLabel(
      [{ lang: 'de', value: '1.2' }, { lang: 'en', value: '1.2' }],
      [{ lang: 'de', value: 'Foo' }]
    );
    expect(result).toEqual([{ lang: 'de', value: '1.2 Foo' }]);
  });
});
