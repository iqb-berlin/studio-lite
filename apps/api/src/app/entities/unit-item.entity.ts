import {
  Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn
} from 'typeorm';
import Unit from './unit.entity';

/**
 * A single item of a unit -- the level below the unit at which metadata, comments and notes can be
 * attached. `uuid` is the primary key the rest of the API addresses an item by; `id` is the name it
 * carries inside its unit, and `variableId` ties it to the variable of the unit's definition it is
 * answered through.
 */
@Entity()
class UnitItem {
  @PrimaryGeneratedColumn()
    uuid: string;

  @Column()
    id: string;

  @ManyToOne(() => Unit)
  @JoinColumn({
    name: 'unit_id'
  })
    unit: Unit;

  @Column()
    order: number;

  @Column()
    locked: boolean;

  @Column()
    position: string;

  @Column({
    name: 'unit_id'
  })
    unitId: number;

  @Column({
    name: 'variable_id'
  })
    variableId: string;

  @Column({
    name: 'variable_read_only_id'
  })
    variableReadOnlyId: string;

  @Column()
    description: string;

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

export default UnitItem;
