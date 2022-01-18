import { AuthService } from './service/auth.service';
import { LocalStrategy } from './local.strategy';
import {PassportModule} from "@nestjs/passport";
import {Module} from "@nestjs/common";
import {LocalAuthGuard} from "./local-auth.guard";
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './auth.constants';
import {JwtAuthGuard} from "./jwt-auth.guard";
import {JwtStrategy} from "./jwt.strategy";
import {DatabaseModule} from "../database/database.module";

@Module({
  imports: [
    PassportModule,
    LocalAuthGuard,
    JwtAuthGuard,
    DatabaseModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    })
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService]
})
export class AuthModule { }
