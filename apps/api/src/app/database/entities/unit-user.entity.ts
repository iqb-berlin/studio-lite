import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
class UnitUser {
  @PrimaryColumn({
    name: 'unit_id'
  })
  public unitId: number;

  @PrimaryColumn({
    name: 'user_id'
  })
  public userId: number;

  @Column({
    type: 'timestamp with time zone',
    name: 'last_seen_comment_changed_at'
  })
  public lastSeenCommentChangedAt: Date;
}

export default UnitUser;
