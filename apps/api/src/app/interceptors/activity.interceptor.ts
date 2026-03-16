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
    if (user && user.id) {
      // We don't await this to keep the request fast (fire and forget)
      this.usersService.updateLastActivity(user.id).catch(() => {
        /* ignore errors */
      });
    }

    return next.handle();
  }
}
