/**
 * Reconciling stored metadata rows with an incoming payload.
 *
 * The metadata profile form re-emits profiles WITHOUT their persisted row id (and
 * without created_at/order), so the write path cannot match stored rows to
 * incoming ones by id. It matches by `profileId` instead: a unit / item holds at
 * most one metadata row per profile, so the profileId is a stable natural key.
 */

/** The four fields the reconciliation needs of a metadata row; everything else stays opaque to it. */
export interface ReconcilableProfile {
  /** The persisted row id. Set on stored rows, absent on what the form re-emits. */
  id: number;
  /** The natural key rows are matched by. A unit or item holds at most one row per profile. */
  profileId?: string;
  /** Kept from the stored row when it is updated, so an edit does not look like a new entry. */
  createdAt?: Date;
  /** The profile's position; see `profile-order.ts`. Inherited when the payload omits it. */
  order?: number;
}

/** The three writes the reconciliation performs, supplied by the caller's repository. */
export interface ProfileReconcileOps<T> {
  /** Delete the stored row with this id — its profile is gone from the payload. */
  remove: (id: number) => Promise<unknown>;
  /** Overwrite the stored row with this id, keeping its identity. */
  update: (id: number, metadata: T) => Promise<unknown>;
  /** Insert a profile that has no stored row yet. */
  add: (metadata: T) => Promise<unknown>;
}

/**
 * Carry identity, creation time and the profile `order` over from the stored row;
 * take everything else (entries/values) from the incoming payload. `order` is only
 * inherited when the incoming payload omits it.
 */
export function mergeProfile<T extends ReconcilableProfile>(existing: T, incoming: T): T {
  return {
    ...existing,
    ...incoming,
    id: existing.id,
    createdAt: existing.createdAt,
    order: incoming.order ?? existing.order
  };
}

/**
 * Match incoming profiles to stored rows by profileId: remove stored rows whose
 * profile is gone, update matches in place (keeping their identity), insert
 * genuinely new profiles.
 *
 * Incoming profiles without a profileId are ignored: `profile_id` is a NOT NULL
 * column so they cannot be persisted anyway. An empty incoming array legitimately
 * clears all stored metadata, but a NON-empty array that contains only malformed
 * (profileId-less) entries is treated as untrustworthy and left as a no-op — so a
 * broken payload can never wipe a unit's/item's entire metadata.
 */
export async function reconcileProfilesByProfileId<T extends ReconcilableProfile>(
  existing: T[],
  incoming: T[],
  ops: ProfileReconcileOps<T>
): Promise<void> {
  const validIncoming = incoming.filter(profile => profile.profileId !== undefined && profile.profileId !== null);
  if (incoming.length > 0 && validIncoming.length === 0) return;
  const incomingProfileIds = new Set(validIncoming.map(profile => profile.profileId));
  await Promise.all(
    existing
      .filter(row => !incomingProfileIds.has(row.profileId))
      .map(row => ops.remove(row.id))
  );
  await Promise.all(validIncoming.map(profile => {
    const match = existing.find(row => row.profileId === profile.profileId);
    return match ? ops.update(match.id, mergeProfile(match, profile)) : ops.add(profile);
  }));
}
