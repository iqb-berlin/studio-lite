import { Column, Entity, PrimaryColumn } from 'typeorm';

/** Ties a rich note to the items it is about, as {@link UnitCommentUnitItem} does for comments. */
@Entity('unit_rich_note_unit_item')
class UnitRichNoteUnitItem {
  @PrimaryColumn({
    name: 'unit_item_uuid'
  })
    unitItemUuid: string;

  @PrimaryColumn({
    name: 'unit_rich_note_id'
  })
    unitRichNoteId: number;

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

export default UnitRichNoteUnitItem;
