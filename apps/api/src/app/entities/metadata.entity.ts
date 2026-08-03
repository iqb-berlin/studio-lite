import { Column, PrimaryGeneratedColumn, ValueTransformer } from 'typeorm';
import { MetadataValuesEntry } from '@studio-lite-lib/api-dto';
import { toW3idProfileId } from '@studio-lite/shared-code';

/**
 * Rewrites the legacy github spelling of an IQB profile id to its canonical w3id
 * form on the way into the database (#1570). Sitting on the column that both
 * UnitMetadata and UnitItemMetadata inherit, this closes the set of writers: no
 * code path — patchMetadata, the unit copy, the item endpoints, or one added
 * later — can persist a profile id in the retired spelling and undo the 19.0.0
 * migration.
 *
 * Reading canonicalizes as well, because the migration cannot be exhaustive: it
 * rewrites the github spelling but leaves w3id variants (a missing trailing slash,
 * `http://`, the `www.` alias) as they are, and its patterns are case-sensitive
 * where the code's are not. Such a row would otherwise come back in a spelling
 * that no longer equals the one a write produces, and reconcileProfilesByProfileId
 * compares exactly — it would delete the existing row and insert a new one instead
 * of updating it. Canonicalizing on the way out heals those rows on first read.
 */
export const profileIdTransformer: ValueTransformer = {
  to: (value?: string): string | undefined => (value ? toW3idProfileId(value) : value),
  from: (value?: string): string | undefined => (value ? toW3idProfileId(value) : value)
};

class Metadata {
  @PrimaryGeneratedColumn()
    id: number;

  @Column({
    type: 'jsonb',
    array: false,
    default: () => "'[]'",
    nullable: false
  })
    entries: MetadataValuesEntry[] = [];

  @Column({
    name: 'profile_id',
    transformer: profileIdTransformer
  })
    profileId: string;

  @Column({
    name: 'order',
    type: 'integer',
    default: -1
  })
    order: number;

  @Column({
    type: 'timestamp with time zone',
    name: 'created_at'
  })
    createdAt: Date;

  @Column({
    type: 'timestamp with time zone',
    name: 'changed_at'
  })
    changedAt: Date;
}

export default Metadata;
