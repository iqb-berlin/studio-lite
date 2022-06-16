import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
class WorkspaceGroup {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public name: string;

  @Column({
    type: 'jsonb',
    array: false,
    default: () => "'{}'",
    nullable: false
  })
  public settings = {};
}

export default WorkspaceGroup;
