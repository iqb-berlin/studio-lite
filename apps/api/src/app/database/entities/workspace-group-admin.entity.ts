import { Entity, PrimaryColumn } from 'typeorm';

@Entity('workspace_group_admin', {name: "workspace_group_admin"})
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
