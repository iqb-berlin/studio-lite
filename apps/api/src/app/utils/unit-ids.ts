/** A unit id as text has to spell it: digits, no sign, no leading zero, no blanks. */
const UNIT_ID = /^[1-9]\d*$/;

/** The largest id the database can hold (a Postgres `integer`). Beyond it a query fails with a 500. */
const MAX_UNIT_ID = 2147483647;

/**
 * A unit id from a request, or 0 when it is not one. Text counts only in its plain spelling -- what
 * `Number` would also make of `0xa`, ` 10` or `10.0` is no unit id here, and neither is an id
 * beyond what the database can hold. Parsing it loosely is what let `abc` pass as "no unit given"
 * before (#1696).
 */
export function unitIdOf(raw: unknown): number {
  let unitId = 0;
  if (typeof raw === 'number') unitId = Number.isInteger(raw) && raw > 0 ? raw : 0;
  if (typeof raw === 'string') unitId = UNIT_ID.test(raw) ? Number(raw) : 0;
  return unitId <= MAX_UNIT_ID ? unitId : 0;
}

/** The unit ids of a list in a request body, a malformed one as 0; `[0]` when it is no list. */
export function unitIdsOfList(raw: unknown): number[] {
  return Array.isArray(raw) ? raw.map(unitIdOf) : [0];
}

/**
 * The unit ids of a comma-separated query parameter, also when it is repeated (`?id=1,2&id=3`), a
 * malformed one as 0; `[0]` when it is missing.
 */
export function unitIdsOfQuery(raw: unknown): number[] {
  if (raw === undefined) return [0];
  return [raw].flat()
    .flatMap(list => String(list).split(','))
    .map(unitIdOf);
}
