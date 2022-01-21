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
}

export default User;
