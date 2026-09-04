import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * The unit's definition -- what the editor produced and the player renders -- kept out of
 * {@link Unit} because it is by far the largest part of a unit and is written on its own.
 */
@Entity()
class UnitDefinition {
  @PrimaryGeneratedColumn()
    id: number;

  @Column()
    data: string;

  @Column({
    name: 'unit_id'
  })
    unitId: number;
}

export default UnitDefinition;
