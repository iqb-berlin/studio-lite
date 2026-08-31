import { Column, Entity, PrimaryColumn } from 'typeorm';
import { TopConcept } from '@studio-lite-lib/api-dto';

/**
 * A controlled vocabulary a profile field draws its values from, cached under its URL. Kept in the
 * SKOS shape it arrives in -- `hasTopConcept` carries the concept tree, `title` and `description`
 * their translations -- so the frontend can show a value's label in the user's language without
 * fetching the vocabulary itself.
 */
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
