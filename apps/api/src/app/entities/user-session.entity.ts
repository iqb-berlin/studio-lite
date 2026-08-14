import {
  Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn
} from 'typeorm';
import User from './user.entity';

@Entity({ name: 'user_session' })
class UserSession {
  @PrimaryGeneratedColumn()
    id: number;

  @Column({ name: 'session_id' })
    sessionId: string;

  @Column({ name: 'user_id' })
    userId: number;

  // Last user interaction. Drives the active/passive status and the inactivity gate.
  @Column({ name: 'last_activity', type: 'timestamptz' })
    lastActivity: Date;

  // Last sign of a still-open tab, kept fresh by the client's session ping even while
  // nobody interacts. Drives the orphaned status; see ORPHANED_SESSION_THRESHOLD_MS.
  @Column({ name: 'last_seen', type: 'timestamptz' })
    lastSeen: Date;

  // Always lastActivity + INACTIVITY_THRESHOLD_MS: a session dies from missing
  // interaction, not from missing pings. SessionCleanupService drops it afterwards.
  @Column({ name: 'expires_at', type: 'timestamptz' })
    expiresAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
    user: User;
}

export default UserSession;
