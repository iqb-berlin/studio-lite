import { Column, Entity, PrimaryColumn } from 'typeorm';

/**
 * Ties a comment to the items it is about, so a remark can be aimed at single items of a unit
 * rather than at the whole of it. A comment with no row here is about the unit.
 */
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
