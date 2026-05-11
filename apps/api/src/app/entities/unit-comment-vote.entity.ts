import {
  Entity, Column, PrimaryColumn
} from 'typeorm';

@Entity('unit_comment_vote')
export default class UnitCommentVote {
  @PrimaryColumn({ name: 'comment_id' })
    commentId!: number;

  @PrimaryColumn({ name: 'user_id' })
    userId!: number;

  @Column({ type: 'varchar', length: 10 })
    vote!: 'up' | 'down';
}
