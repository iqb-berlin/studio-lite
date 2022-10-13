import { Column, Entity, PrimaryColumn } from 'typeorm';

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
}

export default ReviewUnit;
