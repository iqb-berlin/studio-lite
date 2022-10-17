import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { WorkspaceSettingsDto } from '@studio-lite-lib/api-dto';

@Entity('workspace')
class Workspace {
  @PrimaryGeneratedColumn()
    id: number;

  @Column()
    name: string;

  @Column({
    name: 'group_id'
  })
    groupId: number;

  @Column({
    type: 'jsonb',
    array: false,
    default: () => "'{}'",
    nullable: false
  })
    settings: WorkspaceSettingsDto;
}

export default Workspace;
