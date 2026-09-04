import { Column, Entity, PrimaryColumn } from 'typeorm';

/**
 * What a single user has already seen of a single unit. Only the timestamp of the last comment
 * they looked at, which is what the "new comments" marking in the unit list is derived from.
 */
@Entity()
class UnitUser {
  @PrimaryColumn({
    name: 'unit_id'
  })
    unitId: number;

  @PrimaryColumn({
    name: 'user_id'
  })
    userId: number;

  @Column({
    type: 'timestamp with time zone',
    name: 'last_seen_comment_changed_at'
  })
    lastSeenCommentChangedAt: Date;
}

export default UnitUser;
