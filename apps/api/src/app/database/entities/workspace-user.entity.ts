import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
class WorkspaceUser {
  @Column({
    name: 'workspace_id'
  })
  public workspaceId: number;

  @Column({
    name: 'user_id'
  })
  public userId: number;
}

export default WorkspaceUser;
