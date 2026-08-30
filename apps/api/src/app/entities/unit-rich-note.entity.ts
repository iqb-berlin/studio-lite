import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { UnitRichNoteLinkDto } from '@studio-lite-lib/api-dto';

/**
 * A formatted note on a unit, filed under one of the tags the unit's workspace group defines.
 * Unlike a comment it is not part of a discussion -- nobody replies to a note; it is written and
 * revised. `links` carries the references its text points at.
 */
@Entity('unit_rich_note')
class UnitRichNote {
  @PrimaryGeneratedColumn()
    id: number;

  @Column({
    name: 'unit_id'
  })
    unitId: number;

  @Column({
    name: 'tag_id'
  })
    tagId: string;

  @Column('text')
    content: string;

  @Column('jsonb', { nullable: true })
    links: UnitRichNoteLinkDto[];

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

export default UnitRichNote;
