import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('unit_definition')
class UnitDefinition {
  @PrimaryGeneratedColumn()
    id: number;

  @Column()
    data: string;
}

export default UnitDefinition;
