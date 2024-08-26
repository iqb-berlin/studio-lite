import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
class UnitDropBoxHistory {
  @PrimaryGeneratedColumn()
    id: number;

  @Column({
    name: 'unit_id'
  })
    unitId: number;

  @Column({
    name: 'source_workspace_id'
  })
    sourceWorkspaceId: number;

  @Column({
    name: 'target_workspace_id'
  })
    targetWorkspaceId: number;

  @Column({
    type: 'timestamp with time zone',
    name: 'created_at'
  })
    createdAt: Date;
}

export default UnitDropBoxHistory;
