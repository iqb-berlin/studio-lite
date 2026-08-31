import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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
 * token's lifetime the length of the active phase -- see `ACTIVE_THRESHOLD_MS`.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET')
    });
  }

  /**
   * Renames the payload's fields into the shape the rest of the API reads. No database lookup: a
   * signed token is taken at its word, and everything about the user that a route needs beyond
   * these four fields is fetched by that route.
   */
  // eslint-disable-next-line class-methods-use-this
  async validate(payload: JwtPayload) {
    return {
      id: payload.sub,
      name: payload.username,
      reviewId: payload.sub2,
      sessionId: payload.sid
    };
  }
}
