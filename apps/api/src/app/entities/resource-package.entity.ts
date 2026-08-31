import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * A package of files that units can draw on -- fonts, images, whatever a player has to load
 * alongside a unit. `elements` lists the files the package unpacked to; the files themselves are
 * on disk, not in this row.
 */
@Entity()
class ResourcePackage {
  @PrimaryGeneratedColumn()
    id: number;

  @Column()
    name: string;

  @Column('text', { array: true })
    elements;

  @Column({
    type: 'timestamp with time zone',
    name: 'created_at'
  })
    createdAt: Date;
}

export default ResourcePackage;
