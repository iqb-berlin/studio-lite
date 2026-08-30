import { Column, Entity, PrimaryColumn } from 'typeorm';

/**
 * The registry document -- a CSV listing the profile sets that may be chosen -- cached under the
 * URL it was fetched from. Kept as the raw text so a change to how it is read does not need a new
 * download.
 */
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
