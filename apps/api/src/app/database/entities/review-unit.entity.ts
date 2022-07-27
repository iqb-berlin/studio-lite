import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
class ReviewUnit {
  @PrimaryColumn({
    name: 'unit_id'
  })
  public unitId: number;

  @PrimaryColumn({
    name: 'review_id'
  })
  public reviewId: number;

  @Column()
  public order: number;
}

export default ReviewUnit;
