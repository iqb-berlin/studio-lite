import { Entity, PrimaryColumn } from 'typeorm';

@Entity()
class WorkspaceUser {
  @PrimaryColumn({
    name: 'workspace_id'
  })
  public workspaceId: number;

  @PrimaryColumn({
    name: 'user_id'
  })
  public userId: number;
}

export default WorkspaceUser;
