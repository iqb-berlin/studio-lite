import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
class WorkspaceGroup {
  @PrimaryGeneratedColumn()
    id: number;

  @Column()
    name: string;

  @Column({
    type: 'jsonb',
    array: false,
    default: () => "'{}'",
    nullable: false
  })
    settings = {};
}

export default WorkspaceGroup;
