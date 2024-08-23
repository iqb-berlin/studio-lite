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
    name: 'workspace_id'
  })
    workspaceId: number;

  @Column({
    type: 'timestamp with time zone',
    name: 'created_at'
  })
    createdAt: Date;
}

export default UnitDropBoxHistory;
