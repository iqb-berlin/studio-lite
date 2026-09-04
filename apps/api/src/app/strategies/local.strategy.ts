import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../services/auth.service';

/**
 * Name and password at the login route, for the two kinds of login the studio has: a user account
 * and a review link, which authenticates as the review rather than as a person.
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  /**
   * Tries the credentials as a user first, then as a review, and refuses when neither matches. The
   * result is the same shape {@link JwtStrategy} produces, with the unused half zeroed out: a user
   * has `reviewId: 0`, a review login has `id: 0` and no name.
   */
  async validate(username: string, password: string): Promise<unknown> {
    const userId = await this.authService.validateUser(username, password);
    if (userId) {
      return {
        id: userId,
        name: username,
        reviewId: 0
      };
    }
    const reviewId = await this.authService.validateReview(username, password);
    if (reviewId) {
      return {
        id: 0,
        name: '',
        reviewId: reviewId
      };
    }
    throw new UnauthorizedException();
  }
}
