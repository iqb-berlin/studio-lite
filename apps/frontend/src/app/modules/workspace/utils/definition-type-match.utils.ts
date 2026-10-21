/**
 * What a module says about a unit's definition format: it reads it, it does not, or the question
 * cannot be answered -- because one side gave no value or a value this check does not understand.
 */
export type DefinitionTypeMatch = 'compatible' | 'incompatible' | 'unknown';

type Version = [number, number, number];

/** The lowest version a possibly partial one stands for, and the first one above it. */
interface VersionSpan {
  lower: Version;
  upper: Version;
}

const PARTIAL_VERSION = /^(\d+)(?:\.(\d+))?(?:\.(\d+))?$/;
const COMPARATOR = /^(>=|<=|>|<|=)?(.+)$/;

function parseSpan(text: string): VersionSpan | null {
  const match = PARTIAL_VERSION.exec(text);
  if (!match) return null;
  const given = match.slice(1).filter(part => part !== undefined).map(Number);
  const lower = [0, 1, 2].map(i => given[i] ?? 0) as Version;
  // Raising the last part that was given and zeroing the rest is the first version the text no
  // longer covers: "4.12" covers every 4.12.x, "4.12.0" only itself.
  const upper = [0, 1, 2].map(i => {
    if (i < given.length - 1) return given[i];
    return i === given.length - 1 ? given[i] + 1 : 0;
  }) as Version;
  return { lower, upper };
}

function compare(a: Version, b: Version): number {
  return a.map((part, i) => part - b[i]).find(diff => diff !== 0) ?? 0;
}

/** `null` for a comparator outside the plain operators, which counts as not understood. */
function satisfiesComparator(version: Version, comparator: string): boolean | null {
  const [, operator, versionText] = COMPARATOR.exec(comparator) || [];
  const span = versionText ? parseSpan(versionText) : null;
  if (!span) return null;
  switch (operator) {
    case '>=': return compare(version, span.lower) >= 0;
    case '>': return compare(version, span.upper) >= 0;
    case '<': return compare(version, span.lower) < 0;
    case '<=': return compare(version, span.upper) < 0;
    default: return compare(version, span.lower) >= 0 && compare(version, span.upper) < 0;
  }
}

/**
 * Whether `version` lies in `range`: comparators separated by blanks must all hold, alternatives
 * separated by `||` are tried in turn. A version without an operator stands for every version it
 * names (`12.5` is 12.5.x). Caret, tilde, wildcards and hyphen ranges are not understood, and nor
 * is a version with a pre-release suffix -- the answer is then `null`, never `false`.
 */
function satisfiesRange(version: Version, range: string): boolean | null {
  const alternatives = range.split('||').map(alternative => alternative
    .trim()
    .replace(/(>=|<=|>|<|=)\s+/g, '$1')
    .split(/\s+/)
    .filter(comparator => comparator.length > 0));
  if (alternatives.some(comparators => comparators.length === 0)) return null;
  const results = alternatives.map(comparators => {
    const checks = comparators.map(comparator => satisfiesComparator(version, comparator));
    if (checks.some(check => check === null)) return null;
    return checks.every(check => check);
  });
  if (results.some(result => result === null)) return null;
  return results.some(result => result);
}

function splitNameAndVersion(value: string): { name: string; version: string } | null {
  const at = value.indexOf('@');
  if (at <= 0 || at === value.length - 1) return null;
  return { name: value.slice(0, at).trim(), version: value.slice(at + 1).trim() };
}

/**
 * Compares the format a unit definition is written in (`unitDefinitionType` as the editor reported
 * it, `name@version`, e.g. `aspect-unit-definition@4.12.0`) with the `model` of a module's metadata,
 * which names the formats it processes (`name@range`, e.g. `aspect-unit-definition@>=4.0 <=4.12`).
 *
 * Only two known, readable values are compared. A missing value on either side, or one that does
 * not parse, gives `unknown`: older editors report no type and older modules declare no model, and
 * neither may make a unit look unreadable that ran before (#1368).
 */
export function matchDefinitionType(
  unitDefinitionType: string | undefined | null,
  model: string | undefined | null
): DefinitionTypeMatch {
  const unitType = splitNameAndVersion(unitDefinitionType || '');
  const moduleType = splitNameAndVersion(model || '');
  if (!unitType || !moduleType) return 'unknown';
  const unitSpan = parseSpan(unitType.version);
  if (!unitSpan) return 'unknown';
  const inRange = satisfiesRange(unitSpan.lower, moduleType.version);
  if (inRange === null) return 'unknown';
  if (unitType.name !== moduleType.name) return 'incompatible';
  return inRange ? 'compatible' : 'incompatible';
}
