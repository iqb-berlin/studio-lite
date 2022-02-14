import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { WorkspaceSettingsDto } from '@studio-lite-lib/api-dto';

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
    nullable: false
  })
  public settings: WorkspaceSettingsDto;
}

export default Workspace;
