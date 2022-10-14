import { Entity, PrimaryColumn } from 'typeorm';

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
}

export default WorkspaceUser;
