import { Column, PrimaryGeneratedColumn } from 'typeorm';
import { MetadataValuesEntry } from '@studio-lite-lib/api-dto';

class Metadata {
  @PrimaryGeneratedColumn()
    id: number;

  @Column({
    type: 'jsonb',
    array: false,
    default: () => "'[]'",
    nullable: false
  })
    entries: MetadataValuesEntry[] = [];

  @Column({
    name: 'profile_id'
  })
    profileId: string;

  @Column({
    name: 'is_current'
  })
    isCurrent: boolean;

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

export default Metadata;
