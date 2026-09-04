import {
  Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn
} from 'typeorm';
import User from './user.entity';

/**
 * A refresh token, stored only as a hash: the server has to recognize a token it is shown, not be
 * able to produce one. Each belongs to a {@link UserSession}, and its lifetime is the inactivity
 * window -- a token that outlived the window would be a key to a session the server considers gone.
 */
@Entity()
export class RefreshToken {
  @PrimaryGeneratedColumn()
    id: number;

  @Column({ name: 'token_hash' })
    tokenHash: string;

  @Column({ name: 'user_id' })
    userId: number;

  @Column({ name: 'session_id' })
    sessionId: string;

  @Column({ name: 'expires_at', type: 'timestamptz' })
    expiresAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
    user: User;
}
