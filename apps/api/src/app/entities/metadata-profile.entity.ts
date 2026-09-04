import { Column, Entity, PrimaryColumn } from 'typeorm';
import { LanguageCodedText as TextWithLanguage } from '@iqbspecs/metadata-profile';
import { MetadataProfileGroup } from '@studio-lite-lib/api-dto';

/**
 * A metadata profile as it was fetched from its URL, cached here so the studio can show and
 * validate metadata without reaching out to w3id on every request. The id is the profile URL; see
 * `profile-id.ts` for why that URL is stored in one canonical spelling.
 */
@Entity()
class MetadataProfile {
  @PrimaryColumn()
    id: string;

  @Column({
    type: 'jsonb',
    array: false,
    default: () => "'[]'",
    nullable: false
  })
    groups: MetadataProfileGroup[] = [];

  @Column({
    type: 'jsonb',
    array: false,
    default: () => "'[]'",
    nullable: false
  })
    label: TextWithLanguage[] = [];

  @Column({
    type: 'timestamp with time zone',
    name: 'modified_at'
  })
    modifiedAt: Date;
}

export default MetadataProfile;
