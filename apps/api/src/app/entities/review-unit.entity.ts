import {
  Column, Entity, JoinColumn, ManyToOne, PrimaryColumn
} from 'typeorm';
// eslint-disable-next-line import/no-cycle
import Review from './review.entity';

@Entity()
class ReviewUnit {
  @PrimaryColumn({
    name: 'unit_id'
  })
    unitId: number;

  @PrimaryColumn({
    name: 'review_id'
  })
    reviewId: number;

  @Column()
    order: number;

  @ManyToOne(() => Review, review => review.units)
  @JoinColumn({
    name: 'review_id'
  })
    review: Review;
}

export default ReviewUnit;
