import { Column, Entity, PrimaryColumn } from 'typeorm';
import { TextWithLanguage } from '@iqb/metadata';
import { MetadataProfileGroup } from '@studio-lite-lib/api-dto';

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
