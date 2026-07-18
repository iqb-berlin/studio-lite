/**
 * The metadata-values@3.x `order` field replaces the legacy boolean `isCurrent`
 * flag as the single representation of a profile's state:
 *
 *   order = -1   -> hidden/disabled (the former `isCurrent: false`)
 *   order >=  0  -> visible; the value is the position when several profiles are
 *                   used. The profile at position 0 is the current/primary one.
 *
 * `isCurrent` is no longer persisted. `isCurrentFromOrder` is the faithful
 * replacement of the legacy boolean: legacy data had exactly one current profile,
 * which maps to `order: 0` — a visible-but-non-primary profile (order > 0, only
 * possible once multiple profiles are supported) is NOT "the current one".
 */
export const HIDDEN_PROFILE_ORDER = -1;
export const ACTIVE_PROFILE_ORDER = 0;

export function orderFromCurrent(isCurrent: boolean): number {
  return isCurrent ? ACTIVE_PROFILE_ORDER : HIDDEN_PROFILE_ORDER;
}

export function isCurrentFromOrder(order: number | null | undefined): boolean {
  return order === ACTIVE_PROFILE_ORDER;
}
