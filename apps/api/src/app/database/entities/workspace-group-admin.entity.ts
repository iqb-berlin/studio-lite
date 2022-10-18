import { Entity, PrimaryColumn } from 'typeorm';

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
