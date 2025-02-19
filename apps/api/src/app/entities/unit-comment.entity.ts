import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
class UnitComment {
  @PrimaryGeneratedColumn()
    id: number;

  @Column()
    body: string;

  @Column({
    name: 'user_name'
  })
    userName: string;

  @Column({
    name: 'user_id'
  })
    userId: number;

  @Column({
    name: 'parent_id'
  })
    parentId: number | null;

  @Column({
    name: 'unit_id'
  })
    unitId: number;

  @Column({
    type: 'timestamp with time zone',
    name: 'created_at'
  })
    createdAt: Date;

  @Column({
    type: 'timestamp with time zone',
    name: 'changed_at'
  })
    changedAt: Date;
}

export default UnitComment;
