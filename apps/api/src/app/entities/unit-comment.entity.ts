import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * A comment on a unit, from the studio or from a review. `parentId` makes a reply, so a discussion
 * is a tree; `hidden` keeps a comment out of the review's view without deleting it. The author's
 * name is stored alongside the id because a reviewer has no account to look the name up from.
 */
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

  @Column()
    hidden: boolean;

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
