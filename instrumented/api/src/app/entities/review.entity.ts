import {
  Column, Entity, OneToMany, PrimaryGeneratedColumn
} from 'typeorm';
import { ReviewSettingsDto } from '@studio-lite-lib/api-dto';
// eslint-disable-next-line import/no-cycle
import ReviewUnit from './review-unit.entity';

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
}

export default Review;
