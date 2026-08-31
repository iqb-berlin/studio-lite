import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * A group of workspaces, and the level a group admin administers: someone who administers the
 * group ({@link WorkspaceGroupAdmin}) reaches every workspace in it without being assigned to any
 * of them.
 */
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
