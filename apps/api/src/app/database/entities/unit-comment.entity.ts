import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
class UnitComment {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public body: string;

  @Column({
    name: 'user_name'
  })
  public userName: string;

  @Column({
    name: 'user_id'
  })
  public userId: number;

  @Column({
    name: 'parent_id'
  })
  public parentId: number | null;

  @Column({
    name: 'unit_id'
  })
  public unitId: number;

  @Column({
    name: 'unit_id'
  })

  @Column({
    type: 'timestamp with time zone',
    name: 'created_at'
  })
  public createdAt: Date;

  @Column({
    type: 'timestamp with time zone',
    name: 'changed_at'
  })
  public changedAt: Date;
}

export default UnitComment;
