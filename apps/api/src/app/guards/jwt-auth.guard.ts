import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * The guard on nearly every route: it runs the `jwt` passport strategy over the bearer token and
 * puts the user it resolves on the request, which is what all the access guards then read. Named
 * rather than used as `AuthGuard('jwt')` at each route so the strategy name lives in one place.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
