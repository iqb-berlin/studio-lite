import { CodeAsText, ToTextFactory } from '@iqb/responses';
import { CodeData } from '@iqbspecs/coding-scheme/coding-scheme.interface';

const SEPARATOR = '; ';

// ToTextFactory joins the rules of a rule set with "; (R2) ", "; (R3) " and so on, and numbers
// rules only where there is more than one. A rule set is split at the first of each marker, in
// order; a semicolon elsewhere -- in a value, or in the closing "(UND-Verknüpfung; A1)" -- stays.
// A value that itself contains the marker of the next rule would still be split there (#1975).
const splitRules = (description: string, ruleCount: number): string[] => {
  const markers = Array.from({ length: Math.max(ruleCount - 1, 0) }, (_, i) => `${SEPARATOR}(R${i + 2}) `);
  const { lines, rest } = markers.reduce(
    (split, marker) => {
      const at = split.rest.indexOf(marker);
      return at < 0 ? split : {
        lines: [...split.lines, split.rest.slice(0, at)],
        rest: split.rest.slice(at + SEPARATOR.length)
      };
    },
    { lines: [] as string[], rest: description }
  );
  return [...lines, rest];
};

/**
 * The rule sets of a code as the printout shows them: a block per rule set, a line per rule.
 *
 * A code coded by hand whose rule sets are all empty prints none of them (#1975). Where only some
 * are empty, all stay, hint and numbering included: joined with AND, an empty rule set means the
 * code is never assigned automatically; joined with OR, it shows a rule set left without rules.
 */
export function ruleBlocks(
  code: CodeData,
  codeAsText: CodeAsText = ToTextFactory.codeAsText(code, 'EXTENDED')
): string[][] {
  const ruleSets = code.ruleSets ?? [];
  if (code.manualInstruction && ruleSets.every(ruleSet => !ruleSet.rules?.length)) return [];
  return (codeAsText.ruleSetDescriptions ?? [])
    .map((description, i) => splitRules(description, ruleSets[i]?.rules?.length ?? 0));
}
