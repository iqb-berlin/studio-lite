import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Missings profiles -- the codes a codebook lists for answers that are absent rather than wrong.
 *
 * Not in use: the entity is registered with no module, and what the codebook export reads is a
 * {@link Setting} row under the key `missings-profile-iqb-standard`. Nothing writes this table.
 */
@Entity()
class MissingsProfiles {
  @PrimaryGeneratedColumn()
    id!: number;

  @Column()
    label: string;

  @Column({
    type: 'jsonb',
    array: false,
    default: () => "'[]'",
    nullable: false
  })
    missings = [];
}

export default MissingsProfiles;
