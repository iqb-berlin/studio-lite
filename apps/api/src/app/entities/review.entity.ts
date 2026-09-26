import {
  Column, Entity, OneToMany, PrimaryGeneratedColumn, Relation
} from 'typeorm';
import { ReviewSettingsDto } from '@studio-lite-lib/api-dto';

import ReviewUnit from './review-unit.entity';

/**
 * A review: a selection of units from one workspace, reachable through a link and a password by
 * people who have no studio account. The link is what a reviewer logs in with -- see
 * `LocalStrategy`, which authenticates a review rather than a user -- and `settings` decides what
 * the reviewer gets to see and do.
 */
@Entity()
class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'workspace_id'
  })
  workspaceId: number;

  @Column()
  name: string;

  @Column()
  link: string;

  @Column()
  password: string;

  @Column({
    type: 'jsonb',
    array: false,
    default: () => "'{}'",
    nullable: false
  })
  settings: ReviewSettingsDto;

  @OneToMany(() => ReviewUnit, unit => unit.review)
  // See the note in review-unit.entity.ts: the two import each other, and `Relation` keeps the
  // decorator metadata from reading the other class while it is still being evaluated.
  units: Relation<ReviewUnit[]>;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    name: 'created_at'
  })
  createdAt: Date;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    name: 'changed_at'
  })
  changedAt: Date;
}

export default Review;
