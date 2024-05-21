import {
  Column, Entity, JoinColumn, OneToOne, PrimaryColumn
} from 'typeorm';
import Workspace from './workspace.entity';

@Entity()
class WorkspaceUser {
  @PrimaryColumn({
    name: 'workspace_id'
  })
    workspaceId: number;

  @PrimaryColumn({
    name: 'user_id'
  })
    userId: number;

  @Column({
    name: 'has_write_access'
  })
    hasWriteAccess: boolean = false; // default to false

  @OneToOne(() => Workspace)
  @JoinColumn({
    name: 'workspace_id'
  })
    workspace: Workspace;
}

export default WorkspaceUser;
