import {
  ForbiddenException, Inject, Injectable, Logger, forwardRef
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { UsersService } from './users.service';
import { ReviewService } from './review.service';
import { RefreshToken } from '../entities/refresh-token.entity';
import { REFRESH_TOKEN_EXPIRES_IN_SEC, INACTIVITY_THRESHOLD_SEC } from '../app.constants';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    private reviewService: ReviewService,
    private jwtService: JwtService,
    @Inject(getRepositoryToken(RefreshToken))
    private refreshTokenRepository: Repository<RefreshToken>
  ) {
  }

  async validateUser(username: string, pass: string): Promise<number | null> {
    return this.usersService.getUserByNameAndPassword(username, pass);
  }

  async validateReview(reviewKey: string, pass: string): Promise<number | null> {
    return this.reviewService.getReviewByKeyAndPassword(reviewKey, pass);
  }

  async login(user: { id: number, name: string, reviewId: number }): Promise<{
    accessToken: string,
    refreshToken: string
  }> {
    this.logger.log(user.id ?
      `User with id '${user.id}' is logging in.` :
      `Review with id '${user.reviewId}' is logging in.`);
    const payload = { username: user.name, sub: user.id, sub2: user.reviewId };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.generateRefreshToken(user.id);
    return { accessToken, refreshToken };
  }

  async generateRefreshToken(userId: number): Promise<string> {
    const token = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + REFRESH_TOKEN_EXPIRES_IN_SEC);

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const refreshToken = this.refreshTokenRepository.create({
      tokenHash,
      userId,
      expiresAt
    });

    await this.refreshTokenRepository.save(refreshToken);
    return token;
  }

  async refreshAccessToken(token: string): Promise<{ accessToken: string, refreshToken: string } | null> {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { tokenHash, isRevoked: false }
    });

    if (!refreshToken || refreshToken.expiresAt < new Date()) {
      return null;
    }

    const user = await this.usersService.findOne(refreshToken.userId);
    if (!user) return null;

    // Hard inactivity check
    const inactivityThreshold = INACTIVITY_THRESHOLD_SEC * 1000;
    if (user.lastActivity && (Date.now() - new Date(user.lastActivity).getTime()) > inactivityThreshold) {
      this.logger.log(`Denying refresh for user '${user.id}' due to inactivity ` +
        `(${Date.now() - new Date(user.lastActivity).getTime()}ms).`);
      return null;
    }

    // Revoke old token and issue new ones (Token Rotation)
    refreshToken.isRevoked = true;
    await this.refreshTokenRepository.save(refreshToken);

    return this.login({ id: user.id, name: user.name, reviewId: 0 });
  }

  async initLogin(username: string, password: string) {
    if (await this.usersService.hasUsers()) throw new ForbiddenException();
    const newUserId = await this.usersService.create({
      name: username,
      password: password,
      isAdmin: true,
      description: 'first initial user'
    });
    this.logger.log(`First User with id '${newUserId}' is logging in.`);
    const payload = { username: username, sub: newUserId, sub2: 0 };
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
    const tokens = await this.refreshTokenRepository.find({
      where: { userId, isRevoked: false }
    });
    if (tokens.length > 0) {
      this.logger.log(`Logging out user ${userId}: revoking ${tokens.length} tokens.`);
      tokens.forEach(t => { t.isRevoked = true; });
      await this.refreshTokenRepository.save(tokens);
    }
  }

  async logoutByRefreshToken(token: string): Promise<void> {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { tokenHash } // Find even if revoked to identify user
    });
    if (refreshToken) {
      await this.logout(refreshToken.userId);
    }
  }
}
