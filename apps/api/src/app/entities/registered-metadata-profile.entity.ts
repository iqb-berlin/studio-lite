import { Column, Entity, PrimaryColumn } from 'typeorm';
import { LanguageCodedText as TextWithLanguage } from '@iqbspecs/metadata-profile';

@Entity()
class RegisteredMetadataProfile {
  @PrimaryColumn()
    id: string;

  @Column()
    url: string;

  @Column({
    type: 'jsonb',
    array: false,
    default: () => "'[]'",
    nullable: false
  })
    title: TextWithLanguage[] = [];

  @Column()
    creator: string;

  @Column()
    maintainer: string;

  @Column({
    type: 'jsonb',
    array: false,
    default: () => "'[]'",
    nullable: false
  })
    profiles: string[] = [];

  @Column({
    type: 'timestamp with time zone',
    name: 'modified_at'
  })
    modifiedAt: Date;
}

export default RegisteredMetadataProfile;
