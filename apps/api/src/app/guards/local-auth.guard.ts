import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Only for the login route: it runs the `local` passport strategy over name and password and puts
 * the user it authenticates on the request, so the route itself only has to issue the tokens.
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
