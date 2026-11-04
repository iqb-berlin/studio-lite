import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../services/auth.service';

/**
 * What {@link AuthService} puts into an access token. The cryptic names are the JWT convention:
 * `sub` is the subject (the user id), `sub2` carries the review id of a review login, `sid` the
 * session the token belongs to.
 */
type JwtPayload = {
  sub: number;
  username: string;
  sub2: number;
  sid?: string;
};

/**
 * Reads the bearer token on every guarded request and turns its payload into the `request.user`
 * that the guards and the parameter decorators work with.
 *
 * Expired tokens are rejected here (`ignoreExpiration: false`), which is what makes the access
 * token's lifetime the length of the active phase -- see `ACTIVE_THRESHOLD_MS`. A token of an
 * account is also rejected once its session has ended (#2115).
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private authService: AuthService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET')
    });
  }

  /**
   * Renames the payload's fields into the shape the rest of the API reads, after asking whether
   * the token's session is still valid. A signature alone would let a token outlive its session by
   * up to its lifetime: another browser of the account went on working after a new password ended
   * every session, while the admin list already showed the account as inactive (#2115). Everything
   * else about the user that a route needs is fetched by that route.
   *
   * A review login has no account and no session (`sub` is 0) and is taken at its word. An error
   * of the lookup is passed on as it is: answered with a 401, a database outage would log out
   * every browser.
   */
  async validate(payload: JwtPayload) {
    if (payload.sub) {
      const isValid = !!payload.sid && await this.authService.hasValidSession(payload.sub, payload.sid);
      if (!isValid) throw new UnauthorizedException();
    }
    return {
      id: payload.sub,
      name: payload.username,
      reviewId: payload.sub2,
      sessionId: payload.sid
    };
  }
}
