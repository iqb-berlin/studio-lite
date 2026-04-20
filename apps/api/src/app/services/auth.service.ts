import {
  ForbiddenException, Inject, Injectable, Logger, forwardRef
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import * as crypto from 'crypto';
import { UsersService } from './users.service';
import { ReviewService } from './review.service';
import { RefreshToken } from '../entities/refresh-token.entity';
import UserSession from '../entities/user-session.entity';
import {
  REFRESH_TOKEN_EXPIRES_IN_MS,
  INACTIVITY_THRESHOLD_MS
} from '../app.constants';

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
    return existingSessionId || crypto.randomUUID();
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

    const sessionId = AuthService.getSessionId(existingSessionId);
    const accessToken = this.jwtService.sign(AuthService.getJwtPayload(user, sessionId));

    // Reviews do not keep long-lived user sessions.
    if (!user.id) {
      return { accessToken, refreshToken: '' };
    }

    if (!existingSessionId) {
      await this.cleanupExpiredSessions(user.id);
      await this.createUserSession(user.id, sessionId);
    }

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
    const expiresAt = new Date(Date.now() + INACTIVITY_THRESHOLD_MS);
    const session = this.userSessionRepository.create({
      sessionId,
      userId,
      lastActivity: new Date(),
      expiresAt
    });
    await this.userSessionRepository.save(session);
  }

  private async generateRefreshToken(userId: number, sessionId: string): Promise<string> {
    const token = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN_MS);
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

  async refreshAccessToken(token: string): Promise<{ accessToken: string, refreshToken: string } | null> {
    const refreshToken = await this.findRefreshTokenByToken(token);

    if (!refreshToken || refreshToken.expiresAt < new Date()) {
      return null;
    }

    const userSession = await this.findActiveUserSession(refreshToken);
    if (!userSession) {
      return null;
    }

    const inactivityAge = Date.now() - new Date(userSession.lastActivity).getTime();
    if (inactivityAge > INACTIVITY_THRESHOLD_MS) {
      this.logger.log(`Denying refresh for user '${refreshToken.userId}' due to inactivity (${inactivityAge}ms).`);
      return null;
    }

    const user = await this.usersService.findOne(refreshToken.userId);
    if (!user || !user.name) return null;

    // Rotate refresh token and keep the current session alive.
    await this.refreshTokenRepository.delete({ tokenHash: refreshToken.tokenHash });
    userSession.expiresAt = new Date(Date.now() + INACTIVITY_THRESHOLD_MS);
    await this.userSessionRepository.save(userSession);

    return this.login({ id: user.id, name: user.name, reviewId: 0 }, userSession.sessionId);
  }

  async initLogin(username: string, password: string): Promise<string> {
    if (await this.usersService.hasUsers()) throw new ForbiddenException();
    const newUserId = await this.usersService.create({
      name: username,
      password,
      isAdmin: true,
      description: 'first initial user'
    });
    this.logger.log(`First User with id '${newUserId}' is logging in.`);
    const payload = {
      username,
      sub: newUserId,
      sub2: 0,
      sid: crypto.randomUUID()
    };
    return this.jwtService.sign(payload);
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
        await this.userSessionRepository.delete({
          userId: fallbackUserId,
          sessionId: fallbackSessionId
        });
        await this.refreshTokenRepository.delete({
          userId: fallbackUserId,
          sessionId: fallbackSessionId
        });
      }
      return;
    }

    await this.userSessionRepository.delete({
      userId: refreshToken.userId,
      sessionId: refreshToken.sessionId
    });
    await this.refreshTokenRepository.delete({
      userId: refreshToken.userId,
      sessionId: refreshToken.sessionId
    });
  }
}
