import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
class UnitDefinition {
  @PrimaryGeneratedColumn()
    id: number;

  @Column()
    data: string;
}

export default UnitDefinition;
