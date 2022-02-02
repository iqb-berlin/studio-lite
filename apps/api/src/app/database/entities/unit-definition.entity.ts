import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
class UnitDefinition {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public data: string;
}

export default UnitDefinition;
