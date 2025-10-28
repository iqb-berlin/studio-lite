import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
