import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
class User {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public name: string;

  @Column()
  public password: string;

  @Column()
  public description: string | null;

  @Column({
    name: 'is_admin'
  })
  public isAdmin: boolean;

  @Column({
    name: 'last_name'
  })
  public lastName: string | null;

  @Column({
    name: 'first_name'
  })
  public firstName: string | null;

  @Column()
  public email: string | null;

  @Column({
    name: 'email_publish_approved'
  })
  public emailPublishApproved: boolean;
}

export default User;
