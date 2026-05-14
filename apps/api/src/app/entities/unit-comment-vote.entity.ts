import {
  Entity, Column, PrimaryColumn, JoinColumn, ManyToOne
} from 'typeorm';
import User from './user.entity';

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
