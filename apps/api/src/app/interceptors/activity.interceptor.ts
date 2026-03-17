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

    // If an authenticated user is present, update their activity timestamp
    // We ignore background requests like pings and refreshes to allow activity to expire naturally
    // Exclude background requests (pings, refreshes, dashboard polling)
    const isBackgroundRequest = request.url.includes('/ping') ||
                                request.url.includes('/refresh');

    if (user && user.id && !isBackgroundRequest) {
      this.usersService.updateLastActivity(user.id).catch(() => {
        /* ignore errors */
      });
    }

    return next.handle();
  }
}
