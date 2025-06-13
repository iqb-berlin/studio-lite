import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
class MissingsProfiles {
  @PrimaryGeneratedColumn()
    id!: number;

  @Column()
    label: string;

  @Column({
    type: 'jsonb',
    array: false,
    default: () => "'[]'",
    nullable: false
  })
    missings = [];
}

export default MissingsProfiles;
