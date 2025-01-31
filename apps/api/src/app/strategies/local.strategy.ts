import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../service/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

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
