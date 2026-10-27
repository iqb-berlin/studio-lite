import { Column, Entity, PrimaryColumn } from 'typeorm';

/**
 * A refresh token that has been exchanged for a new pair, stored as a hash like the token itself.
 * Shown again after its exchange, it gives away a copy of the token (see
 * `AuthService.refreshAccessToken`). The row belongs to its {@link UserSession} and goes with it.
 */
@Entity({ name: 'used_refresh_token' })
export class UsedRefreshToken {
  @PrimaryColumn({ name: 'token_hash' })
  tokenHash: string;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'session_id' })
  sessionId: string;

  @Column({ name: 'used_at', type: 'timestamptz' })
  usedAt: Date;
}
