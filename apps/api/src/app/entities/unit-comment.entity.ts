import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * A comment on a unit, from the studio or from a review. `parentId` makes a reply, so a discussion
 * is a tree; `hidden` leaves a comment out of what the list shows by default, without deleting it.
 * Setting or clearing it changes the list for everyone, so it takes an account with comment access;
 * a review login cannot (#1784). It does not keep the comment from anyone: whoever sees the list,
 * in a review as well, can show hidden comments in their own view with "ignore visibility
 * settings", and the API hands them out with the rest (#1172). The author's name is stored
 * alongside the id because a reviewer has no account to look the name up from.
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
