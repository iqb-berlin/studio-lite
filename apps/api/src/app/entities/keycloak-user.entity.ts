import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * A user as Keycloak describes them. Registered with TypeORM but read by no service at the moment:
 * the fields a Keycloak login actually needs -- `identity` and `issuer` -- sit on {@link User}
 * itself.
 */
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
