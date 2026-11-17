import {
  ForbiddenException, Inject, Injectable, Logger, UnauthorizedException, forwardRef
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  In, LessThan, MoreThan, QueryFailedError, Repository
} from 'typeorm';
import * as crypto from 'crypto';
import { UsersService } from './users.service';
import { ReviewService } from './review.service';
import { RefreshToken } from '../entities/refresh-token.entity';
import { UsedRefreshToken } from '../entities/used-refresh-token.entity';
import UserSession from '../entities/user-session.entity';
import { findOrphanedSessionIds } from '../utils/orphaned-sessions';
import { PASSIVE_THRESHOLD_MS, REFRESH_TOKEN_REUSE_GRACE_MS } from '../app.constants';

/**
 * Everything about being logged in: checking credentials, issuing the token pair, renewing it, and
 * ending a session.
 *
 * A session is a row of its own ({@link UserSession}) and is not the same as a token. The access
 * token carries the session id and expires with the active phase; the refresh token is stored as a
 * hash and lives as long as the inactivity window. Both lifetimes come from `time.constants.ts`, so
 * "how long may a session be resumed" is answered in one place.
 *
 * Every login gets its own session unless the client hands back the id of one, which is what keeps
 * two browsers of the same person independent while a reload continues where it left off. The
 * client may also choose the id of the session a login opens, so that a login whose answer it never
 * received leaves nothing behind (see {@link resumeOrOpenSession}).
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  private static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  constructor(
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    private reviewService: ReviewService,
    private jwtService: JwtService,
    @Inject(getRepositoryToken(RefreshToken))
    private refreshTokenRepository: Repository<RefreshToken>,
    @Inject(getRepositoryToken(UserSession))
    private userSessionRepository: Repository<UserSession>,
    @Inject(getRepositoryToken(UsedRefreshToken))
    private usedRefreshTokenRepository: Repository<UsedRefreshToken>
  ) {
  }

  async validateUser(username: string, pass: string): Promise<number | null> {
    return this.usersService.getUserByNameAndPassword(username, pass);
  }

  async validateReview(reviewKey: string, pass: string): Promise<number | null> {
    return this.reviewService.getReviewByKeyAndPassword(reviewKey, pass);
  }

  private static getLoginMessage(user: { id: number, reviewId: number }): string {
    return user.id ?
      `User with id '${user.id}' is logging in.` :
      `Review with id '${user.reviewId}' is logging in.`;
  }

  // The ids arrive in the request body unchecked; `RegExp.test` alone would also pass an array.
  private static isSessionId(value?: unknown): value is string {
    return typeof value === 'string' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(value);
  }

  // `rid` names the row of the session, so that a token cannot outlive its row although a later
  // session gets the same id (see hasValidSession). A review login has no row.
  private static getJwtPayload(
    user: { id: number, name: string, reviewId: number },
    sessionId: string,
    sessionRowId?: number
  ): {
    username: string;
    sub: number;
    sub2: number;
    sid: string;
    rid?: number;
  } {
    return {
      username: user.name,
      sub: user.id,
      sub2: user.reviewId,
      sid: sessionId,
      ...(sessionRowId === undefined ? {} : { rid: sessionRowId })
    };
  }

  private async findRefreshTokenByToken(token: string): Promise<RefreshToken | null> {
    return this.refreshTokenRepository.findOne({ where: { tokenHash: AuthService.hashToken(token) } });
  }

  private async findUsedRefreshToken(token: string): Promise<UsedRefreshToken | null> {
    return this.usedRefreshTokenRepository.findOne({ where: { tokenHash: AuthService.hashToken(token) } });
  }

  private async findValidUserSession(userId: number, sessionId: string): Promise<UserSession | null> {
    const userSession = await this.userSessionRepository.findOne({
      where: {
        sessionId,
        userId
      }
    });

    if (!userSession || userSession.expiresAt < new Date()) {
      return null;
    }

    return userSession;
  }

  async login(
    user: { id: number, name: string, reviewId: number },
    existingSessionId?: string,
    newSessionId?: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    this.logger.log(AuthService.getLoginMessage(user));

    // Reviews do not keep long-lived user sessions.
    if (!user.id) {
      const sessionId = AuthService.isSessionId(existingSessionId) ? existingSessionId : crypto.randomUUID();
      const accessToken = this.jwtService.sign(AuthService.getJwtPayload(user, sessionId));
      return { accessToken, refreshToken: '' };
    }

    const sessionId = await this.resumeOrOpenSession(user.id, existingSessionId, newSessionId);
    const sessionRow = await this.userSessionRepository.findOne({ where: { userId: user.id, sessionId } });
    if (!sessionRow) {
      // Ended by a logout or the cleanup in the moment since it was opened.
      throw new UnauthorizedException();
    }
    const accessToken = this.jwtService.sign(AuthService.getJwtPayload(user, sessionId, sessionRow.id));
    const refreshToken = await this.generateRefreshToken(user.id, sessionId);
    return { accessToken, refreshToken };
  }

  /**
   * The session a login goes on in. The session of the client's token (`existingSessionId`, the
   * JWT's `sid`) is continued while it exists and has not expired. Once it has ended -- logged out,
   * ended by a new password, deleted by an admin, expired -- it is not revived: the tokens issued
   * for it would be valid again (#2115).
   *
   * Otherwise the login opens a session under the id the client chose before sending it
   * (`newSessionId`), or under a random one. A login whose answer never reached the client has
   * already opened that session, and the next login from the same storage continues it instead of
   * leaving it behind (#2151). An id whose session has ended can be opened again this way, but as a
   * new row: the access tokens of the ended session name its row and stay refused (see
   * hasValidSession).
   *
   * An id another account already holds is not taken, and the login gets a random one: the cleanup
   * and the status of a session find its tokens by the id alone. The database refuses a second row
   * with the id (`uq_user_session_session_id`), so two logins in the same moment cannot share it
   * either.
   *
   * There is no user-scoped "most recent session" reuse, so that distinct browsers stay
   * independent. A session is therefore scoped to one localStorage, not to one browser: two windows
   * of the same instance share it, while separate instances, private windows and container tabs
   * each get their own row. A row left behind by a storage scope nobody uses any more stays usable
   * until its refresh token expires, and expires with it.
   */
  private async resumeOrOpenSession(
    userId: number,
    existingSessionId?: string,
    newSessionId?: string
  ): Promise<string> {
    if (AuthService.isSessionId(existingSessionId)) {
      const updateResult = await this.updateUserSession(userId, existingSessionId);
      if (updateResult.affected) return existingSessionId;
    }
    await this.cleanupExpiredSessions(userId);
    if (AuthService.isSessionId(newSessionId) && await this.openUserSession(userId, newSessionId)) {
      return newSessionId;
    }
    const sessionId = crypto.randomUUID();
    await this.openUserSession(userId, sessionId);
    return sessionId;
  }

  // The refresh tokens of the rows go with them through the cascade. Deleting tokens by the ids
  // found a moment before would also take the token another login of the account has just written,
  // since the id an expired row had can be opened again (#2151).
  private async cleanupExpiredSessions(userId: number): Promise<void> {
    await this.userSessionRepository.delete({ userId, expiresAt: LessThan(new Date()) });
  }

  /**
   * Opens the session, or moves forward a row the account already has under this id: the login
   * whose answer was lost left it, and two logins from the same storage may arrive at once. Answers
   * false when another account holds the id.
   */
  private async openUserSession(userId: number, sessionId: string): Promise<boolean> {
    const now = new Date();
    try {
      await this.userSessionRepository.upsert(
        {
          sessionId,
          userId,
          lastActivity: now,
          expiresAt: new Date(now.getTime() + PASSIVE_THRESHOLD_MS)
        },
        ['userId', 'sessionId']
      );
      return true;
    } catch (error) {
      if (!AuthService.isSessionIdTaken(error)) throw error;
      // Postgres settles only the upsert's own conflict without an error. A row that another login
      // of the same account writes in the same moment raises it as well, committed by then: whose
      // row it is decides.
      return this.userSessionRepository.exists({ where: { userId, sessionId } });
    }
  }

  // Postgres `unique_violation` of the constraint on the id alone.
  private static isSessionIdTaken(error: unknown): boolean {
    const driverError = error instanceof QueryFailedError ?
      error.driverError as { code?: string, constraint?: string } | undefined :
      undefined;
    return driverError?.code === '23505' && driverError.constraint === 'uq_user_session_session_id';
  }

  // A login counts as interaction, so it moves both timestamps. An expired row stays as it is: its
  // session has ended, only the cleanup has not reached it yet.
  private async updateUserSession(userId: number, sessionId: string): Promise<{ affected?: number }> {
    const now = new Date();
    return this.userSessionRepository.update(
      { userId, sessionId, expiresAt: MoreThan(now) },
      {
        lastActivity: now,
        expiresAt: new Date(now.getTime() + PASSIVE_THRESHOLD_MS)
      }
    );
  }

  private async generateRefreshToken(userId: number, sessionId: string): Promise<string> {
    const token = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date(Date.now() + PASSIVE_THRESHOLD_MS);
    const tokenHash = AuthService.hashToken(token);
    const refreshToken = this.refreshTokenRepository.create({
      tokenHash,
      userId,
      sessionId,
      expiresAt
    });
    await this.refreshTokenRepository.save(refreshToken);
    return token;
  }

  async logoutSession(userId: number, sessionId: string): Promise<void> {
    await this.refreshTokenRepository.delete({ userId, sessionId });
    await this.userSessionRepository.delete({ userId, sessionId });
  }

  /**
   * Bulk counterpart to logoutOrphanedSession, for a user whose rows the hourly cleanup has not
   * reached yet. Deletes exactly the ids that were found rather than re-evaluating the condition:
   * between the two statements a session can acquire a fresh token, and a second predicate would
   * spare its row after its tokens are already gone.
   */
  async deleteOrphanedSessions(userId: number): Promise<number> {
    const ids = await findOrphanedSessionIds(
      this.userSessionRepository,
      this.refreshTokenRepository,
      { userId }
    );
    if (ids.length === 0) {
      return 0;
    }
    await this.refreshTokenRepository
      .createQueryBuilder()
      .delete()
      .where('userId = :userId AND sessionId IN (:...ids)', { userId, ids })
      .execute();
    const result = await this.userSessionRepository.delete({ userId, sessionId: In(ids) });
    return result.affected || 0;
  }

  async logoutOrphanedSession(userId: number, sessionId: string): Promise<boolean> {
    const orphanedIds = await findOrphanedSessionIds(
      this.userSessionRepository,
      this.refreshTokenRepository,
      { userId, sessionId }
    );
    if (orphanedIds.length === 0) {
      return false;
    }

    await this.logoutSession(userId, sessionId);
    return true;
  }

  /**
   * A refresh token that was exchanged before and comes back has been copied: whoever used it first
   * got the new pair. Which side is the copy cannot be told, so the session ends for both, the
   * token that took this one's place included (RFC 9700, 4.14.2). Within the grace period the
   * second use is taken for a second tab of the same browser and only refused.
   *
   * The warning is no proof of theft: a tab closed during a refresh sends the old token again when
   * it is reopened.
   */
  private async endSessionOfReusedToken(token: string): Promise<void> {
    const usedToken = await this.findUsedRefreshToken(token);
    if (!usedToken || Date.now() - usedToken.usedAt.getTime() <= REFRESH_TOKEN_REUSE_GRACE_MS) {
      return;
    }
    this.logger.warn(
      `Refresh token of user '${usedToken.userId}' was used again after its exchange; ` +
      `ending session '${usedToken.sessionId}'.`
    );
    await this.logoutSession(usedToken.userId, usedToken.sessionId);
  }

  async refreshAccessToken(token: string): Promise<{ accessToken: string, refreshToken: string } | null> {
    const refreshToken = await this.findRefreshTokenByToken(token);

    if (!refreshToken) {
      await this.endSessionOfReusedToken(token);
      return null;
    }

    if (refreshToken.expiresAt < new Date()) {
      return null;
    }

    // The expiry check inside findValidUserSession is the inactivity gate: expiresAt is
    // always lastActivity plus PASSIVE_THRESHOLD_MS, so a session that outlives its
    // inactivity window is exactly a session whose row has expired. A second comparison
    // against lastActivity used to sit here and could not ever be true.
    const userSession = await this.findValidUserSession(refreshToken.userId, refreshToken.sessionId);
    if (!userSession) {
      return null;
    }

    const user = await this.usersService.findOne(refreshToken.userId);
    if (!user || !user.name) return null;

    // Keep the session identity stable across refreshes: rotate only the refresh token,
    // but keep the same sessionId. Re-creating the session with a new id (or latching onto
    // another browser's most-recent session) is exactly what collapsed independent browser
    // sessions into one.
    // A row that vanished between the lookup above and here was deleted by a logout or
    // by an admin while this refresh was in flight; re-creating it would undo that.
    // The new token is written before the old one is dropped, so the session is never
    // without a key: a session with no unexpired refresh token is reported as orphaned and
    // may be deleted, and the row being rotated belongs to someone who is working.
    // The old token is recorded as used before it goes, so that a second use can be told apart
    // from an unknown token. Two refreshes with the same token in flight record the same hash;
    // the second record is dropped rather than failing the refresh.
    const { sessionId } = userSession;
    const newRefreshToken = await this.generateRefreshToken(user.id, sessionId);
    await this.usedRefreshTokenRepository
      .createQueryBuilder()
      .insert()
      .values({
        tokenHash: refreshToken.tokenHash,
        userId: user.id,
        sessionId,
        usedAt: new Date()
      })
      .orIgnore()
      .execute();
    await this.refreshTokenRepository.delete({ tokenHash: refreshToken.tokenHash });

    const accessToken = this.jwtService.sign(
      AuthService.getJwtPayload({ id: user.id, name: user.name, reviewId: 0 }, sessionId, userSession.id)
    );
    return { accessToken, refreshToken: newRefreshToken };
  }

  // The first login of an installation takes the id for its session as every other login does.
  // After a reload the page knows the user exists, and the next attempt goes to the normal login and
  // continues that session.
  async initLogin(
    username: string,
    password: string,
    newSessionId?: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    if (await this.usersService.hasUsers()) throw new ForbiddenException();
    const newUserId = await this.usersService.create({
      name: username,
      password,
      isAdmin: true,
      description: 'first initial user'
    });
    this.logger.log(`First User with id '${newUserId}' is logging in.`);
    return this.login({ id: newUserId, name: username, reviewId: 0 }, undefined, newSessionId);
  }

  /**
   * Whether an access token of this session may still be used: exactly as long as a refresh could
   * still renew the session. A session ended by a logout, a new password or the deletion of its
   * account has no row any more, and an expired one could not be resumed (#2115).
   *
   * A login may open a session under the id of one that has ended (#2151). That is a new row, and
   * a token naming the row of the ended one (`sessionRowId`) is refused. A token without a row was
   * issued before tokens named it and is taken by its session id while it lasts.
   */
  async hasValidSession(userId: number, sessionId: string, sessionRowId?: number): Promise<boolean> {
    const userSession = await this.findValidUserSession(userId, sessionId);
    return !!userSession && (sessionRowId === undefined || userSession.id === sessionRowId);
  }

  async isAdminUser(userId: number): Promise<boolean> {
    return !!userId && this.usersService.getUserIsAdmin(userId);
  }

  async isWorkspaceGroupAdmin(userId: number, workspaceGroupId?: number): Promise<boolean> {
    const isAdmin = await this.usersService.getUserIsAdmin(userId);
    if (isAdmin === true) return true;
    return this.usersService.isWorkspaceGroupAdmin(userId, workspaceGroupId);
  }

  async canAccessWorkSpace(userId: number, workspaceId: number): Promise<boolean> {
    return this.usersService.canAccessWorkSpace(userId, workspaceId);
  }

  async logout(userId: number): Promise<void> {
    await this.refreshTokenRepository.delete({ userId });
    await this.userSessionRepository.delete({ userId });
  }

  /**
   * Ends the session the refresh token belongs to. A token that has already been exchanged still
   * names its session: a browser whose refresh answer got lost -- the tab was reloaded or closed
   * while it ran -- holds only the token before it and logs out with that one. Ending nothing would
   * leave the session resumable for a week by a token no browser holds (#2110). No grace period
   * here, unlike the refresh: whoever logs out wants the session gone, and with the exchanged token
   * a refresh after the grace period would end it anyway.
   */
  async logoutCurrentSession(
    token: string,
    fallbackUserId?: number,
    fallbackSessionId?: string
  ): Promise<void> {
    const refreshToken = await this.findRefreshTokenByToken(token);
    if (refreshToken) {
      await this.logoutSession(refreshToken.userId, refreshToken.sessionId);
      return;
    }

    if (fallbackUserId && fallbackSessionId) {
      await this.logoutSession(fallbackUserId, fallbackSessionId);
      return;
    }

    const usedToken = await this.findUsedRefreshToken(token);
    if (usedToken) {
      this.logger.log(
        `Logout of user '${usedToken.userId}' came with an exchanged refresh token; ` +
        `ending session '${usedToken.sessionId}'.`
      );
      await this.logoutSession(usedToken.userId, usedToken.sessionId);
    }
  }
}
