import { Entity, PrimaryColumn } from 'typeorm';

/**
 * Who administers a workspace group. Deliberately separate from {@link WorkspaceUser}: a group
 * admin holds no access level in any of the group's workspaces, which is why the
 * `…OrGroupAdmin…` guards exist alongside the plain ones.
 */
@Entity()
class WorkspaceGroupAdmin {
  @PrimaryColumn({
    name: 'workspace_group_id'
  })
    workspaceGroupId: number;

  @PrimaryColumn({
    name: 'user_id'
  })
    userId: number;
}

export default WorkspaceGroupAdmin;
