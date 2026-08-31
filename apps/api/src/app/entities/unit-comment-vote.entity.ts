import {
  Entity, Column, PrimaryColumn, JoinColumn, ManyToOne
} from 'typeorm';
import User from './user.entity';

/**
 * One vote per user and comment -- the pair is the primary key, so a second vote replaces the
 * first rather than adding to it.
 */
@Entity('unit_comment_vote')
export default class UnitCommentVote {
  @PrimaryColumn({ name: 'comment_id' })
    commentId!: number;

  @PrimaryColumn({ name: 'user_id' })
    userId!: number;

  @Column({ type: 'varchar', length: 10 })
    vote!: 'up' | 'down';

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
    user!: User;
}
