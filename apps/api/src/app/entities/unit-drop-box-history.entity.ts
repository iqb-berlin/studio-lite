import {
  Column, Entity, PrimaryGeneratedColumn, Unique
} from 'typeorm';

/**
 * Remembers that a unit was submitted from one workspace into another's drop box, and whether it
 * has since been sent back (`returned`). That is what lets both sides see where a unit came from
 * and where it went, once the unit itself has moved on.
 *
 * Moving a unit outside the drop box removes its history: it is then no longer a submission.
 */
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
