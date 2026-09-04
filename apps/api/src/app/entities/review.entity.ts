import {
  Column, Entity, OneToMany, PrimaryGeneratedColumn
} from 'typeorm';
import { ReviewSettingsDto } from '@studio-lite-lib/api-dto';
// eslint-disable-next-line import/no-cycle
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
    units: ReviewUnit[];

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
