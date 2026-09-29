import {
  Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, Relation
} from 'typeorm';

import Review from './review.entity';

/** Which units a review shows, and in which order. */
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
  // `Relation` keeps `emitDecoratorMetadata` from writing a runtime reference to Review here.
  // Review and ReviewUnit import each other, and under ESM that reference is read before the
  // other module has finished evaluating -- "Cannot access 'Review' before initialization".
  review: Relation<Review>;
}

export default ReviewUnit;
