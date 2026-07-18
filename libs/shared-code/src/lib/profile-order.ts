/**
 * The metadata-values@3.x `order` field replaces the legacy boolean `isCurrent`
 * flag as the single representation of a profile's state:
 *
 *   order = -1   -> hidden/disabled (the former `isCurrent: false`)
 *   order >=  0  -> visible; the value is the position when several profiles are
 *                   used. Today a unit/item has at most one visible profile, so
 *                   the active one is `order: 0`.
 *
 * `isCurrent` is no longer persisted; where the legacy XML export still speaks in
 * terms of "the current profile", it is derived from `order` via these helpers.
 */
export const HIDDEN_PROFILE_ORDER = -1;
export const ACTIVE_PROFILE_ORDER = 0;

export function orderFromCurrent(isCurrent: boolean): number {
  return isCurrent ? ACTIVE_PROFILE_ORDER : HIDDEN_PROFILE_ORDER;
}

export function isCurrentFromOrder(order: number | null | undefined): boolean {
  return (order ?? HIDDEN_PROFILE_ORDER) !== HIDDEN_PROFILE_ORDER;
}
