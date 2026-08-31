import {
  Column, Entity, PrimaryGeneratedColumn, Unique
} from 'typeorm';

/**
 * The marker that a unit's metadata has moved into the normalized tables ({@link UnitMetadata} and
 * {@link UnitItemMetadata}). For a unit marked here, the older `metadata` column on {@link Unit} is
 * no longer read -- the read path takes the tables instead. One row per unit, and it stays.
 */
@Entity()
@Unique('unit_id_unique', ['unitId'])
class UnitMetadataToDelete {
  @PrimaryGeneratedColumn()
    id: number;

  @Column({
    name: 'unit_id'
  })
    unitId: number;

  @Column({
    type: 'timestamp with time zone',
    name: 'changed_at'
  })
    changedAt: Date;

  @Column({
    type: 'timestamp with time zone',
    name: 'created_at'
  })
    createdAt: Date;
}

export default UnitMetadataToDelete;
