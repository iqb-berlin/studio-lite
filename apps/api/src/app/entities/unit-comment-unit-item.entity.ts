import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
class UnitCommentUnitItem {
  @PrimaryColumn({
    name: 'unit_item_uuid'
  })
    unitItemUuid: string;

  @PrimaryColumn({
    name: 'unit_comment_id'
  })
    unitCommentId: number;

  @Column({
    name: 'unit_id'
  })
    unitId: number;

  @Column({
    type: 'timestamp with time zone',
    name: 'created_at'
  })
    createdAt: Date;

  @Column({
    type: 'timestamp with time zone',
    name: 'changed_at'
  })
    changedAt: Date;
}

export default UnitCommentUnitItem;
