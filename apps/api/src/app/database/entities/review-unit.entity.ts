import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('review_unit', {name: "review_unit"})
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
}

export default ReviewUnit;
