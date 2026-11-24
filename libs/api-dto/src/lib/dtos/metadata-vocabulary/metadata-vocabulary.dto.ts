// eslint-disable-next-line max-classes-per-file
import { ApiProperty } from '@nestjs/swagger';

export class TopConcept {
  notation!: string[];
  /** The term by language, e.g. `{ de: 'Längsschnitt', en: 'Longitudinal' }`. */
  prefLabel!: Record<string, string>;
  narrower!: TopConcept[];
  id!: string;
}

export class MetadataVocabularyDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  type!: string;

  @ApiProperty()
  description!: Record<string, string>;

  @ApiProperty()
  title!: Record<string, string>;

  @ApiProperty()
  hasTopConcept!: TopConcept[];

  @ApiProperty()
  '@context'!: Record<string, never>;

  @ApiProperty()
  modifiedAt!: Date;
}
