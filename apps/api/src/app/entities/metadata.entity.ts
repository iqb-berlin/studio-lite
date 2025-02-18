import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { MetadataValuesEntry } from '@studio-lite-lib/api-dto';

@Entity()
class Metadata {
  @PrimaryGeneratedColumn()
    id: number;

  @Column({
    type: 'jsonb',
    array: false,
    default: () => "'[]'",
    nullable: false
  })
    data: MetadataValuesEntry[] = [];

  @Column()
    profile: string;

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
