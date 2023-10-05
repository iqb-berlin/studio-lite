import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
class KeycloakUser {
  @PrimaryGeneratedColumn()
    id: number;

  @Column()
    identity: string;

  @Column()
    issuer: string;

  @Column()
    username: string;

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
}

export default KeycloakUser;
