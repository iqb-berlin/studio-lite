import {
  ForbiddenException, Inject, Injectable, Logger, forwardRef
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  In, LessThan, MoreThan, Repository
} from 'typeorm';
import * as crypto from 'crypto';
import { UsersService } from './users.service';
import { ReviewService } from './review.service';
import { RefreshToken } from '../entities/refresh-token.entity';
import UserSession from '../entities/user-session.entity';
import { ACTIVE_THRESHOLD_MS, PASSIVE_THRESHOLD_MS } from '../app.constants';

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
    private userSessionRepository: Repository<UserSession>
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

  private static getSessionId(existingSessionId?: string): string {
    if (existingSessionId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(existingSessionId)) {
      return existingSessionId;
    }
    return crypto.randomUUID();
  }

  private static getJwtPayload(user: { id: number, name: string, reviewId: number }, sessionId: string): {
    username: string;
    sub: number;
    sub2: number;
    sid: string;
  } {
    return {
      username: user.name,
      sub: user.id,
      sub2: user.reviewId,
      sid: sessionId
    };
  }

  private async findRefreshTokenByToken(token: string): Promise<RefreshToken | null> {
    return this.refreshTokenRepository.findOne({ where: { tokenHash: AuthService.hashToken(token) } });
  }

  private async findActiveUserSession(refreshToken: RefreshToken): Promise<UserSession | null> {
    const userSession = await this.userSessionRepository.findOne({
      where: {
        sessionId: refreshToken.sessionId,
        userId: refreshToken.userId
      }
    });

    if (!userSession || userSession.expiresAt < new Date()) {
      return null;
    }

    return userSession;
  }

  async login(
    user: { id: number, name: string, reviewId: number },
    existingSessionId?: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    this.logger.log(AuthService.getLoginMessage(user));

    let sessionId = AuthService.getSessionId(existingSessionId);
    const isNewSession = !existingSessionId;

    // No user-scoped "most recent session" reuse here: every fresh login (i.e. no
    // client-provided sessionId) gets its own session, so distinct browsers stay
    // independent. Same-browser continuity is handled via the explicit
    // existingSessionId that the client derives from the JWT `sid`.
    //
    // A session is therefore scoped to one localStorage, not to one browser: two windows
    // of the same instance share it, while separate instances, private windows and
    // container tabs each get their own row. A row left behind by a storage scope nobody
    // uses any more stays usable until its refresh token expires, and expires with it.

    // Reviews do not keep long-lived user sessions.
    if (!user.id) {
      const accessToken = this.jwtService.sign(AuthService.getJwtPayload(user, sessionId));
      return { accessToken, refreshToken: '' };
    }

    if (isNewSession) {
      await this.cleanupExpiredSessions(user.id);
      await this.createUserSession(user.id, sessionId);
    } else {
      // If we are reusing a session, update its expiry and last activity.
      const updateResult = await this.updateUserSession(user.id, sessionId);

      // If the session was not found (e.g. already deleted or wrong format rejected by regex),
      // we must create a new one with a fresh UUID.
      if (updateResult.affected === 0) {
        sessionId = crypto.randomUUID();
        await this.createUserSession(user.id, sessionId);
      }
    }

    const accessToken = this.jwtService.sign(AuthService.getJwtPayload(user, sessionId));
    const refreshToken = await this.generateRefreshToken(user.id, sessionId);
    return { accessToken, refreshToken };
  }

  private async cleanupExpiredSessions(userId: number): Promise<void> {
    const now = new Date();
    const expiredSessions = await this.userSessionRepository.find({
      where: { userId, expiresAt: LessThan(now) },
      select: { sessionId: true }
    });
    if (expiredSessions.length > 0) {
      const expiredIds = expiredSessions.map(s => s.sessionId);
      await this.refreshTokenRepository
        .createQueryBuilder()
        .delete()
        .where('userId = :userId AND sessionId IN (:...ids)', { userId, ids: expiredIds })
        .execute();
      await this.userSessionRepository.delete({ userId, expiresAt: LessThan(now) });
    }
  }

  private async createUserSession(userId: number, sessionId: string): Promise<void> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + PASSIVE_THRESHOLD_MS);
    const session = this.userSessionRepository.create({
      sessionId,
      userId,
      lastActivity: now,
      expiresAt
    });
    await this.userSessionRepository.save(session);
  }

  // A login counts as interaction, so it moves both timestamps.
  private async updateUserSession(userId: number, sessionId: string): Promise<{ affected?: number }> {
    const now = new Date();
    return this.userSessionRepository.update(
      { userId, sessionId },
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

  // The sessions of this user that nobody can return to: not usable with an access token
  // (nothing interacted with them for longer than the active phase) and not renewable,
  // because no unexpired refresh token is left. Expired rows are excluded -- those belong
  // to SessionCleanupService, not to a delete the admin has to trigger by hand.
  //
  // Read order matters. Sessions first, tokens second: a refresh that lands in between
  // shows up as a live token and spares its session. The other order would let the same
  // refresh hide the token from us and take the session with it.
  private async findOrphanedSessionIds(userId: number, sessionId?: string): Promise<string[]> {
    const nowMs = Date.now();
    const now = new Date(nowMs);
    const candidates = await this.userSessionRepository.find({
      where: {
        userId,
        ...(sessionId ? { sessionId } : {}),
        expiresAt: MoreThan(now),
        lastActivity: LessThan(new Date(nowMs - ACTIVE_THRESHOLD_MS))
      },
      select: { sessionId: true }
    });
    if (candidates.length === 0) {
      return [];
    }
    const candidateIds = candidates.map(session => session.sessionId);
    const liveTokens = await this.refreshTokenRepository.find({
      where: { userId, sessionId: In(candidateIds), expiresAt: MoreThan(now) },
      select: { sessionId: true }
    });
    const resumableIds = new Set(liveTokens.map(token => token.sessionId));
    return candidateIds.filter(id => !resumableIds.has(id));
  }

  // Bulk counterpart to logoutOrphanedSession, for a user who has collected several rows
  // that can no longer be continued. Deletes exactly the ids that were found rather than
  // re-evaluating the condition: between the two statements a session can acquire a fresh
  // token, and a second predicate would spare its row after its tokens are already gone.
  async deleteOrphanedSessions(userId: number): Promise<number> {
    const ids = await this.findOrphanedSessionIds(userId);
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
    const orphanedIds = await this.findOrphanedSessionIds(userId, sessionId);
    if (orphanedIds.length === 0) {
      return false;
    }

    await this.logoutSession(userId, sessionId);
    return true;
  }

  async refreshAccessToken(token: string): Promise<{ accessToken: string, refreshToken: string } | null> {
    const refreshToken = await this.findRefreshTokenByToken(token);

    if (!refreshToken || refreshToken.expiresAt < new Date()) {
      return null;
    }

    // The expiry check inside findActiveUserSession is the inactivity gate: expiresAt is
    // always lastActivity plus PASSIVE_THRESHOLD_MS, so a session that outlives its
    // inactivity window is exactly a session whose row has expired. A second comparison
    // against lastActivity used to sit here and could not ever be true.
    const userSession = await this.findActiveUserSession(refreshToken);
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
    const { sessionId } = userSession;
    const newRefreshToken = await this.generateRefreshToken(user.id, sessionId);
    await this.refreshTokenRepository.delete({ tokenHash: refreshToken.tokenHash });

    const accessToken = this.jwtService.sign(
      AuthService.getJwtPayload({ id: user.id, name: user.name, reviewId: 0 }, sessionId)
    );
    return { accessToken, refreshToken: newRefreshToken };
  }

  async initLogin(username: string, password: string): Promise<{ accessToken: string; refreshToken: string }> {
    if (await this.usersService.hasUsers()) throw new ForbiddenException();
    const newUserId = await this.usersService.create({
      name: username,
      password,
      isAdmin: true,
      description: 'first initial user'
    });
    this.logger.log(`First User with id '${newUserId}' is logging in.`);
    return this.login({ id: newUserId, name: username, reviewId: 0 });
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

  async logoutCurrentSession(
    token: string,
    fallbackUserId?: number,
    fallbackSessionId?: string
  ): Promise<void> {
    const refreshToken = await this.findRefreshTokenByToken(token);

    if (!refreshToken) {
      if (fallbackUserId && fallbackSessionId) {
        await this.logoutSession(fallbackUserId, fallbackSessionId);
      }
      return;
    }

    await this.logoutSession(refreshToken.userId, refreshToken.sessionId);
  }
}
