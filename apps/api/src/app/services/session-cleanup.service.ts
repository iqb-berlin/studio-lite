import {
  Inject, Injectable, Logger, OnApplicationBootstrap
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { getRepositoryToken } from '@nestjs/typeorm';
import { In, LessThan, Repository } from 'typeorm';
import { RefreshToken } from '../entities/refresh-token.entity';
import UserSession from '../entities/user-session.entity';
import { findOrphanedSessionIds } from '../utils/orphaned-sessions';

/**
 * Sweeps up what login and logout leave behind: sessions past their expiry, refresh tokens past
 * theirs, and sessions nobody can return to any more (see `findOrphanedSessionIds`).
 *
 * Runs every hour and once at start-up, because a server that was down over the expiry of a row
 * would otherwise carry it until the next tick.
 */
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
      const orphanCount = await this.deleteOrphanedSessions();
      const sessionCount = sessions.affected || 0;
      const tokenCount = tokens.affected || 0;
      if (sessionCount > 0 || tokenCount > 0 || orphanCount > 0) {
        this.logger.log(
          `Removed ${sessionCount} expired user session(s) and ${tokenCount} expired refresh token(s)` +
          `${orphanCount > 0 ? `, plus ${orphanCount} session(s) no token could resume` : ''}.`
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

  // A session that no token can resume should not exist: it is what is left when a row
  // outlives its last refresh token instead of going with it. Expiry alone does not catch
  // them, because expiresAt tracks the last interaction while the token's lifetime starts
  // at the last rotation, so a row can survive its final token by up to the active phase --
  // and a logout that only got half done leaves one behind for a whole week.
  //
  // Removing them here is what makes the orphan count in the admin list an alarm rather
  // than a category: in normal operation nothing accumulates, and whatever shows up
  // between two runs is either an hour old at most or worth looking into. The count is
  // logged so it stays visible instead of being quietly tidied away.
  private async deleteOrphanedSessions(): Promise<number> {
    const ids = await findOrphanedSessionIds(this.userSessionRepository, this.refreshTokenRepository);
    if (ids.length === 0) {
      return 0;
    }
    await this.refreshTokenRepository.delete({ sessionId: In(ids) });
    const result = await this.userSessionRepository.delete({ sessionId: In(ids) });
    return result.affected || 0;
  }
}
