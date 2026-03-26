import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { UnitRichNoteLinkDto } from '@studio-lite-lib/api-dto';

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
