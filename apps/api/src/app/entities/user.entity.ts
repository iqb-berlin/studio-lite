import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * A studio account. `isAdmin` is the one flag that opens the whole administration; everything else
 * a user may do follows from workspace assignments and group administrations.
 *
 * `identity` and `issuer` are set for an account that logs in through Keycloak instead of with the
 * password stored here; see {@link KeycloakUser}.
 */
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

  @Column()
    identity: string | null;

  @Column()
    issuer: string | null;

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
