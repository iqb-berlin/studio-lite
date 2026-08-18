import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { UsersService } from '../services/users.service';
import { BACKGROUND_REQUEST_KEY, BackgroundRequestMode } from '../decorators/background-request.decorator';

@Injectable()
export class ActivityInterceptor implements NestInterceptor {
  constructor(
    private readonly usersService: UsersService,
    private readonly reflector: Reflector
  ) {}

  private static hasUserIntent(request: { headers?: Record<string, string | string[] | undefined> }): boolean {
    const header = request.headers?.['x-activity-intent'];
    return header === 'user' || (Array.isArray(header) && header.includes('user'));
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Read from the handler first, then the controller, so a whole controller can be
    // marked if that ever makes sense.
    const mode = this.reflector.getAllAndOverride<BackgroundRequestMode>(
      BACKGROUND_REQUEST_KEY,
      [context.getHandler(), context.getClass()]
    );

    const isBackgroundRequest = mode === 'always' ||
      (mode === 'unless-user-intent' && !ActivityInterceptor.hasUserIntent(request));

    if (user && user.id && !isBackgroundRequest) {
      this.usersService.updateLastActivity(user.id, user.sessionId).catch(() => {
        /* ignore errors */
      });
    }

    return next.handle();
  }
}
