import {
  Inject, Injectable, Logger, OnApplicationBootstrap
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { RefreshToken } from '../entities/refresh-token.entity';
import UserSession from '../entities/user-session.entity';

@Injectable()
export class SessionCleanupService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SessionCleanupService.name);

  constructor(
    @Inject(getRepositoryToken(UserSession))
    private userSessionRepository: Repository<UserSession>,
    @Inject(getRepositoryToken(RefreshToken))
    private refreshTokenRepository: Repository<RefreshToken>
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    // Catch up on rows that expired while the API was not running.
    await this.cleanupExpiredRows();
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handleScheduledCleanup(): Promise<void> {
    await this.cleanupExpiredRows();
  }

  async cleanupExpiredRows(): Promise<void> {
    try {
      const now = new Date();
      const sessions = await this.userSessionRepository.delete({ expiresAt: LessThan(now) });
      const tokens = await this.refreshTokenRepository.delete({ expiresAt: LessThan(now) });
      const sessionCount = sessions.affected || 0;
      const tokenCount = tokens.affected || 0;
      if (sessionCount > 0 || tokenCount > 0) {
        this.logger.log(
          `Removed ${sessionCount} expired user session(s) and ${tokenCount} expired refresh token(s).`
        );
      }
    } catch (error) {
      // Never escalate a failed cleanup; the next scheduled run picks up the backlog.
      this.logger.error(
        'Cleanup of expired sessions failed.',
        error instanceof Error ? error.stack : `${error}`
      );
    }
  }
}
