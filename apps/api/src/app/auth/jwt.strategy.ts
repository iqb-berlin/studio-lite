import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from './auth.constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret
    });
  }

  // eslint-disable-next-line class-methods-use-this
  async validate(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload: any
  ) {
    return { id: payload.sub, name: payload.username, reviewId: payload.sub2 };
  }
}
