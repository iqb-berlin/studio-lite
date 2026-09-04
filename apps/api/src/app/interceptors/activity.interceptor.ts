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

/**
 * Keeps a session alive for as long as its user is actually working. Every request that is not
 * marked as background stamps the session's last activity, and the inactivity window is measured
 * from that stamp.
 *
 * What must not count is the frontend talking to itself -- polls, token refreshes, the admin list
 * reloading itself -- because that would keep an unattended browser logged in forever. Those routes
 * carry {@link BackgroundRequest}; see there for why this is a marking on the handler and no longer
 * a match against the URL.
 *
 * The stamp is written without waiting for it and its failure is swallowed on purpose: it is
 * bookkeeping alongside the request, and no response should fail over it.
 */
@Injectable()
export class ActivityInterceptor implements NestInterceptor {
  constructor(
    private readonly usersService: UsersService,
    private readonly reflector: Reflector
  ) {}

  /**
   * Whether the client declared this request as user-triggered (`x-activity-intent: user`). Only
   * consulted for a route marked `unless-user-intent`, where the same handler serves both a poll
   * and a refresh someone clicked.
   */
  private static hasUserIntent(request: { headers?: Record<string, string | string[] | undefined> }): boolean {
    const header = request.headers?.['x-activity-intent'];
    return header === 'user' || (Array.isArray(header) && header.includes('user'));
  }

  /** Stamps the session unless the route is marked as background, then lets the request through. */
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
