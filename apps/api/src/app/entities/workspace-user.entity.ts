import {
  Column, Entity, JoinColumn, OneToOne, PrimaryColumn
} from 'typeorm';
import Workspace from './workspace.entity';

/**
 * Who may do what in a workspace. The row's existence is the read permission; `accessLevel` raises
 * it from there -- commenting, writing, managing, and at the top deleting. The guards in `guards/`
 * each name the level they require.
 */
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
