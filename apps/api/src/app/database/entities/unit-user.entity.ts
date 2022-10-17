import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('unit_user')
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
