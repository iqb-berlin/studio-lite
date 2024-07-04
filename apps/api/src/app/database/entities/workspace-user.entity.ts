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
    name: 'access_level'
  })
    accessLevel: number = 0; // default

  @OneToOne(() => Workspace)
  @JoinColumn({
    name: 'workspace_id'
  })
    workspace: Workspace;
}

export default WorkspaceUser;
