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
/** The order a hidden/disabled profile carries — the former `isCurrent: false`. */
export const HIDDEN_PROFILE_ORDER = -1;
/** The first visible position, held by the current/primary profile. */
export const ACTIVE_PROFILE_ORDER = 0;

/** Turns the legacy boolean into the order it stands for, for data still arriving in the old shape. */
export function orderFromCurrent(isCurrent: boolean): number {
  return isCurrent ? ACTIVE_PROFILE_ORDER : HIDDEN_PROFILE_ORDER;
}

/**
 * The faithful replacement of the legacy boolean: only the profile at position 0 is "the current
 * one". A visible-but-non-primary profile (order > 0, possible once several profiles are used) is
 * not, and neither is a missing order.
 */
export function isCurrentFromOrder(order: number | null | undefined): boolean {
  return order === ACTIVE_PROFILE_ORDER;
}
