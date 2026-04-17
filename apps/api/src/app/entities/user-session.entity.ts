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

  @Column({ name: 'last_activity', type: 'timestamp' })
    lastActivity: Date;

  @Column({ name: 'expires_at', type: 'timestamp' })
    expiresAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
    user: User;
}

export default UserSession;
