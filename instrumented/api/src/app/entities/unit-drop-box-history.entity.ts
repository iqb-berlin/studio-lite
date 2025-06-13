import {
  Column, Entity, PrimaryGeneratedColumn, Unique
} from 'typeorm';

@Entity()
@Unique('unit_source_target', ['unitId', 'sourceWorkspaceId', 'targetWorkspaceId'])
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

  @Column()
    returned: boolean;

  @Column({
    type: 'timestamp with time zone',
    name: 'changed_at'
  })
    changedAt: Date;
}

export default UnitDropBoxHistory;
