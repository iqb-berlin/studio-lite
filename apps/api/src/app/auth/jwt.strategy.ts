import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET')
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
