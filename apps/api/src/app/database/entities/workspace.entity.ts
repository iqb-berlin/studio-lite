import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
class Workspace {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public name: string;

  @Column({
    name: 'group_id'
  })
  public groupId: number;

  @Column({
    type: 'jsonb',
    array: false,
    default: () => "'{}'",
    nullable: false,
  })
  public settings = {};
}

export default Workspace;
