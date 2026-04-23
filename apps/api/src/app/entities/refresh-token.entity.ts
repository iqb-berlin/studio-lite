import {
  Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn
} from 'typeorm';
import User from './user.entity';

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

  @Column({ name: 'expires_at', type: 'timestamp' })
    expiresAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
    user: User;
}
