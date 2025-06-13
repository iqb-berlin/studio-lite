import { Column, Entity, PrimaryColumn } from 'typeorm';
import { TopConcept } from '@studio-lite-lib/api-dto';

@Entity()
class MetadataVocabulary {
  @PrimaryColumn()
    id: string;

  @Column()
    type: string;

  @Column({
    type: 'jsonb',
    array: false,
    default: () => "'null'",
    nullable: true
  })
    description: Record<string, string> = null;

  @Column({
    type: 'jsonb',
    array: false,
    default: () => "'{}'",
    nullable: false
  })
    title: Record<string, string> = {};

  @Column({
    type: 'jsonb',
    array: false,
    default: () => "'null'",
    nullable: true
  })
    hasTopConcept: TopConcept[] = null;

  @Column({
    type: 'jsonb',
    array: false,
    default: () => "'{}'",
    nullable: false
  })
    '@context': Record<string, never> = {};

  @Column({
    type: 'timestamp with time zone',
    name: 'modified_at'
  })
    modifiedAt: Date;
}

export default MetadataVocabulary;
