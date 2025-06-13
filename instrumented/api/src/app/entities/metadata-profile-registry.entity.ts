import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
class MetadataProfileRegistry {
  @PrimaryColumn()
    id: string;

  @Column()
    csv: string;

  @Column({
    type: 'timestamp with time zone',
    name: 'modified_at'
  })
    modifiedAt: Date;
}

export default MetadataProfileRegistry;
