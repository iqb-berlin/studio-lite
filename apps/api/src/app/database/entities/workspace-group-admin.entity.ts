import { Entity, PrimaryColumn } from 'typeorm';

@Entity()
class WorkspaceGroupAdmin {
  @PrimaryColumn({
    name: 'workspace_group_id'
  })
  public workspaceGroupId: number;

  @PrimaryColumn({
    name: 'user_id'
  })
  public userId: number;
}

export default WorkspaceGroupAdmin;
