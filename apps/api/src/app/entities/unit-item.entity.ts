import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
class UnitItem {
  @PrimaryGeneratedColumn()
    uuid: string;

  @Column()
    id: string;

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
