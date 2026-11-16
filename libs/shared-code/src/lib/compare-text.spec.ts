import { byText, compareText } from './compare-text';

const sorted = (texts: string[]): string[] => [...texts].sort(compareText);

describe('compareText (#1872)', () => {
  it('takes upper and lower case for the same letter', () => {
    expect(sorted(['Aa01', 'Ab01', 'Ba01', 'Bb01', 'aa02', 'ab02', 'ba02', 'bb02']))
      .toEqual(['Aa01', 'aa02', 'Ab01', 'ab02', 'Ba01', 'ba02', 'Bb01', 'bb02']);
  });

  it('puts umlauts with their base letters', () => {
    expect(sorted(['Zusatz', 'lesen', 'Ökologie', 'Algebra', 'Übung', 'mathe', 'Orthografie']))
      .toEqual(['Algebra', 'lesen', 'mathe', 'Ökologie', 'Orthografie', 'Übung', 'Zusatz']);
  });

  it('reads digits as numbers', () => {
    expect(sorted(['Unit10', 'Unit2', 'Unit1', '1.10', '1.9'])).toEqual(['1.9', '1.10', 'Unit1', 'Unit2', 'Unit10']);
  });

  it('puts the lower-case spelling first where nothing else differs', () => {
    expect(sorted(['Abc', 'abc'])).toEqual(['abc', 'Abc']);
  });

  it('gives two texts a fixed order although the dictionary takes them for equal', () => {
    expect(compareText('Unit02', 'Unit2')).toBeLessThan(0);
    expect(compareText('Unit2', 'Unit02')).toBeGreaterThan(0);
    expect(compareText('Unit2', 'Unit2')).toBe(0);
  });
});

describe('byText', () => {
  const names = (entries: { name?: string | null }[]): (string | null | undefined)[] => entries
    .map(entry => entry.name);

  it('sorts entries by the text taken from each, a missing text first', () => {
    const entries = [{ name: 'b' }, { name: null }, { name: 'A' }, {}];
    expect(names(entries.sort(byText(entry => entry.name)))).toEqual([null, undefined, 'A', 'b']);
  });

  it('puts entries without a text last when asked to', () => {
    const entries = [{ name: 'b' }, { name: '' }, { name: 'A' }, { name: null }];
    expect(names(entries.sort(byText(entry => entry.name, true)))).toEqual(['A', 'b', '', null]);
  });
});
