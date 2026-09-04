import {
  Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn
} from 'typeorm';
import { WorkspaceSettingsDto } from '@studio-lite-lib/api-dto';
import WorkspaceGroup from './workspace-group.entity';

/**
 * A workspace: the place units live in and the unit of access control. Every user reaches a unit
 * through their assignment to its workspace ({@link WorkspaceUser}), and the workspace's settings
 * decide which modules and metadata profiles apply to the units in it.
 *
 * `dropBoxId` names the workspace units from here are submitted to, if there is one; the submission
 * itself is recorded in {@link UnitDropBoxHistory}.
 */
@Entity()
class Workspace {
  @PrimaryGeneratedColumn()
    id: number;

  @Column()
    name: string;

  @Column({
    name: 'group_id'
  })
    groupId: number;

  @Column({
    name: 'drop_box_id',
    nullable: true
  })
    dropBoxId: number;

  @Column({
    type: 'jsonb',
    array: false,
    default: () => "'{}'",
    nullable: false
  })
    settings: WorkspaceSettingsDto;

  @OneToOne(() => WorkspaceGroup)
  @JoinColumn({
    name: 'group_id'
  })
    workspaceGroup: WorkspaceGroup;
}

export default Workspace;
