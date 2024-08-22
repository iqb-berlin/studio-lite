import {
  Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn
} from 'typeorm';
import { WorkspaceSettingsDto } from '@studio-lite-lib/api-dto';
import WorkspaceGroup from './workspace-group.entity';

@Entity()
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
    name: 'drop_box_workspace_id'
  })
    dropBoxWorkspaceId: number;

  @Column({
    type: 'jsonb',
    array: false,
    default: () => "'{}'",
    nullable: false
  })
    settings: WorkspaceSettingsDto;

  @OneToOne(() => WorkspaceGroup)
  @JoinColumn({
    name: 'group_id'
  })
    workspaceGroup: WorkspaceGroup;
}

export default Workspace;
