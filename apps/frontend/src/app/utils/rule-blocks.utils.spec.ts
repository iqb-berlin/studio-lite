import { CodeData, RuleSet } from '@iqbspecs/coding-scheme/coding-scheme.interface';
import { ruleBlocks } from './rule-blocks.utils';

describe('ruleBlocks', () => {
  const blocksOf = (ruleSets: RuleSet[], manualInstruction = '', ruleSetOperatorAnd = false): string[][] => {
    const code: CodeData = {
      id: 1, label: '', score: 1, type: 'FULL_CREDIT', ruleSetOperatorAnd, manualInstruction, ruleSets
    };
    return ruleBlocks(code);
  };
  const match = (value: string) => ({ method: 'MATCH' as const, parameters: [value] });

  const byHand = '<p>Bitte von Hand kodieren.</p>';
  const empty = () => ({ rules: [], ruleOperatorAnd: true });

  // Coded by hand, a code without any rule has none to state, whatever prefix the hint carries (#1974, #1975).
  it.each([
    [1, ['Keine Regeln definiert.']],
    [2, ['Regelset 1: Keine Regeln definiert.', 'Regelset 2: Keine Regeln definiert.']]
  ])('should leave out %i empty rule sets only for a code coded by hand', (count, hints) => {
    const emptyRuleSets = Array.from({ length: count }, empty);

    expect(blocksOf(emptyRuleSets)).toEqual(hints.map(hint => [hint]));
    expect(blocksOf(emptyRuleSets, byHand)).toEqual([]);
  });

  // Joined with AND, the empty rule set keeps the code from being assigned automatically; joined
  // with OR, it shows a rule set left without rules. Either way the numbering stays whole (#1975).
  it.each([true, false])('should keep an empty rule set beside one with rules, joined with AND %s', and => {
    expect(blocksOf([empty(), { ruleOperatorAnd: true, rules: [match('a')] }], byHand, and)).toEqual([
      ['Regelset 1: Keine Regeln definiert.'],
      ["Regelset 2: Übereinstimmung (Zahl/Text) mit 'a'"]
    ]);
  });

  it('should put each rule on a line of its own', () => {
    const [lines] = blocksOf([{ ruleOperatorAnd: true, rules: [match('a'), match('b')] }]);

    expect(lines.length).toBe(2);
    expect(lines[0]).toMatch(/^\(R1\) .*'a'$/);
    expect(lines[1]).toMatch(/^\(R2\) .*'b' \(UND-Verknüpfung\)$/);
  });

  // A semicolon is a boundary only between rules; a rule set of one rule has no numbers (#1975).
  it.each(['a;b', 'x; (R1) y', 'x; (R2) y'])('should keep the single value %j on one line', value => {
    expect(blocksOf([{ ruleOperatorAnd: false, rules: [match(value)] }])).toEqual([
      [`Übereinstimmung (Zahl/Text) mit '${value}'`]
    ]);
  });

  it('should keep the connector and the array position of the last rule on its line (#1975)', () => {
    const [lines] = blocksOf([{ ruleOperatorAnd: true, valueArrayPos: 0, rules: [match('a'), match('b')] }]);

    expect(lines.length).toBe(2);
    expect(lines[1]).toMatch(/\(UND-Verknüpfung; A1\)$/);
  });
});
