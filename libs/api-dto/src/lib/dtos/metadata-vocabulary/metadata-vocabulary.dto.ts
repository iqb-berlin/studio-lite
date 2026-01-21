// eslint-disable-next-line max-classes-per-file
import { ApiProperty } from '@nestjs/swagger';

export class TopConcept {
  notation!: string[];
  prefLabel!: { de: string };
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
