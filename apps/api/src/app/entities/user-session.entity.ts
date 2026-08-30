import {
  Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn
} from 'typeorm';
import User from './user.entity';

/**
 * One login of one user, kept apart from the tokens issued for it: several browsers of the same
 * person are several sessions and expire independently.
 *
 * A session's state is read off the two thresholds in `time.constants.ts` and the tokens that still
 * exist for it -- active while an access token can be valid, passive while a refresh token can
 * resume it, orphaned once neither is left (see `findOrphanedSessionIds`).
 */
@Entity({ name: 'user_session' })
class UserSession {
  @PrimaryGeneratedColumn()
    id: number;

  @Column({ name: 'session_id' })
    sessionId: string;

  @Column({ name: 'user_id' })
    userId: number;

  // Last user interaction. Drives the active status and the inactivity gate.
  @Column({ name: 'last_activity', type: 'timestamptz' })
    lastActivity: Date;

  // Always lastActivity + PASSIVE_THRESHOLD_MS: a session dies from missing
  // interaction. SessionCleanupService drops the row afterwards.
  @Column({ name: 'expires_at', type: 'timestamptz' })
    expiresAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
    user: User;
}

export default UserSession;
