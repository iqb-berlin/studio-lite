import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { UsersService } from '../services/users.service';

@Injectable()
export class ActivityInterceptor implements NestInterceptor {
  constructor(private readonly usersService: UsersService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const activityIntentHeader = request.headers?.['x-activity-intent'];
    const hasExplicitUserActivityIntent = activityIntentHeader === 'user' ||
      (Array.isArray(activityIntentHeader) && activityIntentHeader.includes('user'));

    // Ignore background requests that must not extend inactivity windows by default.
    const isBackgroundRequest = request.url.includes('/ping') ||
                                request.url.includes('/refresh');

    // The admin users polling endpoint only counts as activity when explicitly flagged.
    const isUnflaggedGroupAdminUsersRequest = request.url.includes('/group-admin/users') &&
      !hasExplicitUserActivityIntent;

    if (user && user.id && !isBackgroundRequest && !isUnflaggedGroupAdminUsersRequest) {
      this.usersService.updateLastActivity(user.id).catch(() => {
        /* ignore errors */
      });
    }

    return next.handle();
  }
}
