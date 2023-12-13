import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../database/services/users.service';
import { ReviewService } from '../../database/services/review.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private reviewService: ReviewService,
    private jwtService: JwtService
  ) {
  }

  async validateUser(username: string, pass: string): Promise<number | null> {
    return this.usersService.getUserByNameAndPassword(username, pass);
  }

  async validateReview(reviewKey: string, pass: string): Promise<number | null> {
    return this.reviewService.getReviewByKeyAndPassword(reviewKey, pass);
  }

  async login(user) {
    this.logger.log(user.id ?
      `User with id '${user.id}' is logging in.` :
      `Review with id '${user.reviewId}' is logging in.`);
    const payload = { username: user.name, sub: user.id, sub2: user.reviewId };
    return this.jwtService.sign(payload);
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
    return userId && this.usersService.getUserIsAdmin(userId);
  }

  async isWorkspaceGroupAdmin(userId: number, workspaceGroupId?: number): Promise<boolean> {
    const isAdmin = await this.usersService.getUserIsAdmin(userId);
    if (isAdmin === true) return true;
    return this.usersService.isWorkspaceGroupAdmin(userId, workspaceGroupId);
  }

  async canAccessWorkSpace(userId: number, workspaceId: number): Promise<boolean> {
    return this.usersService.canAccessWorkSpace(userId, workspaceId);
  }

  async canAccessReview(userId: number, reviewIdInToken: number, reviewIdToCheck: number): Promise<boolean> {
    if (reviewIdInToken === reviewIdToCheck) return true;
    return this.usersService.canAccessReview(userId, reviewIdToCheck);
  }
}
