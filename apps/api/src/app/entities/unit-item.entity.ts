import {
  Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn
} from 'typeorm';
import Unit from './unit.entity';

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
    weighting: number;

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
