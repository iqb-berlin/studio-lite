import {
  Column, Entity, PrimaryGeneratedColumn, Unique
} from 'typeorm';

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
