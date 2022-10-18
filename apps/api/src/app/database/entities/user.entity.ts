import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
class User {
  @PrimaryGeneratedColumn()
    id: number;

  @Column()
    name: string;

  @Column()
    password: string;

  @Column()
    description: string | null;

  @Column({
    name: 'is_admin'
  })
    isAdmin: boolean;

  @Column({
    name: 'last_name'
  })
    lastName: string | null;

  @Column({
    name: 'first_name'
  })
    firstName: string | null;

  @Column()
    email: string | null;

  @Column({
    name: 'email_publish_approved'
  })
    emailPublishApproved: boolean;
}

export default User;
